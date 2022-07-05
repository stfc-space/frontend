import {
  CloudFrontClient,
  GetDistributionCommand,
  UpdateDistributionCommand
} from '@aws-sdk/client-cloudfront';
import {
  LambdaClient,
  UpdateFunctionCodeCommand,
  GetFunctionCommand,
  State
} from '@aws-sdk/client-lambda';

import AdmZip from 'adm-zip';
import fs from 'fs';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const myArgs = process.argv.slice(2);
const distId = myArgs[0];
const functionName = myArgs[1];
const workerFile = myArgs[2];
const eventType = myArgs[3] ?? 'origin-request';

var zip = new AdmZip();

zip.addFile('exports.js', fs.readFileSync(workerFile));
var lambdaZip = zip.toBuffer();

const lambdaClient = new LambdaClient({ region: 'us-east-1' });
const updatedLambda = await lambdaClient.send(
  new UpdateFunctionCodeCommand({
    FunctionName: functionName,
    ZipFile: lambdaZip,
    Publish: true
  })
);

console.log('Waiting for lambda to be ready');
for (;;) {
  const r = await lambdaClient.send(
    new GetFunctionCommand({ FunctionName: functionName, Qualifier: updatedLambda.Version })
  );
  if (r.Configuration.State === State.Active) {
    break;
  }
  console.log('Lambda still pending...');
  await sleep(2000);
}
console.log('Lambda ready.');

const cloudfrontClient = new CloudFrontClient({ region: 'us-east-1' });
const command = new GetDistributionCommand({
  Id: distId
});

const distribution = await cloudfrontClient.send(command);
console.log(distribution.Distribution.DistributionConfig.DefaultCacheBehavior);

let lambdaAssociation;
if (
  distribution.Distribution.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations
    .Quantity == 0
) {
  lambdaAssociation = {
    LambdaFunctionARN: updatedLambda.FunctionArn,
    EventType: eventType,
    IncludeBody: eventType == 'origin-request'
  };
  distribution.Distribution.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations = {
    Quantity: 1,
    Items: [lambdaAssociation]
  };
} else {
  lambdaAssociation =
    distribution.Distribution.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Items.find(
      (x) => x.EventType === eventType
    );

  if (!lambdaAssociation) {
    lambdaAssociation = {
      LambdaFunctionARN: updatedLambda.FunctionArn,
      EventType: eventType,
      IncludeBody: eventType == 'origin-request'
    };
    distribution.Distribution.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations += 1;
    distribution.Distribution.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Items.push(
      lambdaAssociation
    );
  }
}

lambdaAssociation.LambdaFunctionARN = updatedLambda.FunctionArn;
await cloudfrontClient.send(
  new UpdateDistributionCommand({
    DistributionConfig: distribution.Distribution.DistributionConfig,
    Id: distId,
    IfMatch: distribution.ETag
  })
);
