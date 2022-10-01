import { error } from '@sveltejs/kit';

type Unarray<T> = T extends Array<infer U> ? U : T;
type RemoveType<U, Y> = U extends Y ? never : U;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type DataLoadResult<U> = RemoveType<RemoveType<U, Array<PromiseSettledResult<void>>>, void>;
type HelperResult<U> = UnionToIntersection<DataLoadResult<Unarray<U>>>;

function isPromiseSettledResult(v: unknown): v is PromiseSettledResult<unknown> {
  return v instanceof Object && 'value' in v && 'status' in v;
}

export async function dataLoadHelper<U, T extends Iterable<U | PromiseLike<U>>>(
  promises: T
): Promise<HelperResult<{ -readonly [P in keyof T]: Awaited<T[P]> }>> {
  try {
    return Object.assign(
      {},
      ...(await Promise.all(promises)).map((result) => {
        // Remove PromiseSettledResult from things
        if (isPromiseSettledResult(result)) {
          return result.status == 'fulfilled' ? result.value : {};
        } else {
          return result;
        }
      })
    );
  } catch (e) {
    if ('response' in e) {
      // Mande fetch error
      throw error(e.response.status, 'test');
    } else {
      throw error(500, e);
    }
  }
}
