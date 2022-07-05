/* global ASSETS */
import { Server } from 'SERVER';
import { manifest, prerendered } from 'MANIFEST';

import type {
  CloudFrontHeaders,
  CloudFrontRequest,
  CloudFrontRequestHandler,
  CloudFrontRequestResult
} from 'aws-lambda';
import { BodyInfo, fromStrictBody, log, toRawBody } from './util';
import { promises as dns } from 'dns';

const server = new Server(manifest);

const prefix = `/${manifest.appDir}/`;

/**
 * This function will change the origin based on the X-DNS-ORIGIN header,
 * if it's set as a CustomHeader in the CloudFront Origin config
 *
 * It expects the value of this header to be a domain name of a regional S3
 * bucket endpoint (bucketname.s3.region.amazonaws.com), it will throw an
 * error if this header is set, but the domain resolves to something else,
 * or fails to resolve.
 *
 * This will make it possible to do an easy switch between regions, either
 * manual by editing the DNS record to point to another bucket, or automatic
 * by using Route53 features.
 */
async function forwardDNSS3(request: CloudFrontRequest) {
  if ('customHeaders' in request.origin.s3 && 'x-dns-origin' in request.origin.s3.customHeaders) {
    const hostname = request.origin.s3.customHeaders['x-dns-origin'][0].value;
    const records = await dns.resolveTxt(hostname);

    /**
     * records is a multidimentional array, so:
     * select a random element from the outermust array to get one record
     * each record should only contain one chunk (array is created by
     * assuming a record is CSV), so select the first element.
     */
    const domainName = records[Math.floor(Math.random() * records.length)][0];

    /**
     * domainName must use the format bucketname.s3.region.amazonaws.com.
     * Other formats are currently not supported, because we need to get
     * the region to create the SIGV4 signature used by the OAI. If you
     * don't use an OAI, you don't need the region, but it doesn't hurt
     * either.
     */
    const labels = domainName.split('.');
    if (labels.slice(-2).join('.') != 'amazonaws.com') {
      throw 'invalid domainName format';
    }

    const region = labels.slice(-3)[0];

    // Set S3 origin to the values from the DNS record
    request.origin.s3.region = region;
    request.origin.s3.domainName = domainName;
    request.headers['host'] = [{ key: 'host', value: domainName }];

    return request;
  } else {
    // do nothing
    return request;
  }
}

export const handler: CloudFrontRequestHandler = async (event, context, callback) => {
  log('DEBUG', 'incoming event', event);

  if (event.Records.length !== 1) {
    log('ERROR', 'bad request', event);
    return {
      status: '400',
      statusDescription: 'bad request'
    };
  }
  const request = event.Records[0].cf.request;
  const config = event.Records[0].cf.config;

  if (request.body && request.body.inputTruncated) {
    log('ERROR', 'input trucated', request);
    log(
      'ERROR',
      'ref',
      'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html#lambda-at-edge-function-restrictions'
    );
    throw new Error('input truncated');
  }

  const uri = request.uri;

  // check generated asset_set for static files
  if (uri.startsWith(prefix)) {
    return await forwardDNSS3(request);
  }

  const pathname = uri.replace(/\/$/, '');
  const file = pathname.substring(1);

  const isPrerendered = prerendered.has(pathname || '/');
  const isAsset = manifest.assets.has(file);
  const isIndexAsset = manifest.assets.has(file + '/index.html');
  if (isAsset || isIndexAsset || isPrerendered) {
    if (isPrerendered || isIndexAsset) {
      request.uri = '/' + pathname + '/index.html';
    }
    return await forwardDNSS3(request);
  }

  const query = new URLSearchParams(request.querystring);
  query.delete('_lang');
  query.delete('_ch');
  query.delete('_rch');
  const queryString = query.toString();

  const headers = transformIncomingHeaders(request.headers);
  const host = headers['x-forwarded-host'];
  const method = request.method.toUpperCase();
  const canHaveBody = method !== 'GET' && method !== 'HEAD';
  const input = new Request(
    'https://' + host + pathname + (queryString.length > 0 ? '?' + queryString : ''),
    {
      headers: headers,
      method: request.method,
      body: canHaveBody && request.body ? toRawBody(request.body) : undefined
    }
  );

  log('DEBUG', 'render input', headers);

  const rendered = await server.respond(input, {
    getClientAddress() {
      return headers['true-client-ip'] || request.clientIp;
    }
  });

  if (rendered && rendered.status != 404) {
    log('DEBUG', 'render output', rendered);

    const outgoing: CloudFrontRequestResult = await transformResponse(rendered);
    log('DEBUG', 'outgoing response', outgoing);
    log('INFO', 'handler', {
      path: request.uri,
      status: rendered.status
    });
    return outgoing;
  }

  return await forwardDNSS3(request);
};

function transformIncomingHeaders(headers: CloudFrontHeaders): HeadersInit {
  const h = Object.fromEntries(Object.entries(headers).map(([k, vs]) => [k, vs[0].value]));
  delete h[':method'];
  delete h[':path'];
  delete h[':authority'];
  delete h[':scheme'];
  return h;
}

async function transformResponse(rendered: Response): Promise<CloudFrontRequestResult> {
  const body: BodyInfo | undefined = rendered.body
    ? fromStrictBody(new Uint8Array(await rendered.arrayBuffer()))
    : undefined;
  return {
    status: rendered.status.toString(),
    headers: transformOutgoingHeaders(rendered.headers),
    body: body?.data || '',
    bodyEncoding: body?.encoding || 'text'
  };
}

function transformOutgoingHeaders(headers: HeadersInit): CloudFrontHeaders {
  if (headers instanceof Headers) {
    const rv: CloudFrontHeaders = {}
    headers.forEach((v, k) => {
      rv[k.toLowerCase()] = [{
        key: k,
        value: v
      }]
    });

    let cookies;
    if ('raw' in headers) {
      const r = (headers as any).raw();
      if (r['set-cookie'] !== undefined) {
        cookies = r['set-cookie'];
      }
    } else {
      cookies = (headers as any).getAll('set-cookie');
    }
    if (cookies) {
      rv['set-cookie'] = cookies.map((v) => ({ key: 'set-cookie', value: v }));
    }
    return rv;
  } else {
    return Object.fromEntries(
      Object.entries(headers).map(([k, vs]) => [
        k,
        typeof vs === 'string' ? [{ value: vs }] : vs.map((v) => ({ value: v }))
      ])
    );
  }
}
