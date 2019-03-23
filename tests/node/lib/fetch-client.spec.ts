import fetchMock from 'fetch-mock';
import { describe, expect, it } from '../suite';
import FetchClient from '../../../src/lib/fetch-client';

describe('FetchClient', () => {
  it('should make a GET request', async () => {
    fetchMock.get('/api/', true);

    expect(await new FetchClient().get<boolean>('/api/')).to.be.true;
  });

  it('should make a POST request', async () => {
    const response = { id: 1, foo: 'bar' };
    type T = { id: number, foo: string };

    fetchMock.post(
      (url, opts) => url === '/api/' && opts.body === JSON.stringify({ foo: 'bar' }),
      response,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(await new FetchClient().post<T>('/api/', { foo: 'bar' })).to.deep.equal(response);
  });

  it('should make a PATCH request for a collection', async () => {
    const response = { id: 1, foo: 'bar' };
    type T = { id: number, foo: string };

    fetchMock.patch(
      (url, opts) => url === '/api/' && opts.body === JSON.stringify({ id: 1, foo: 'bar' }),
      response,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(await new FetchClient().patch<T[]>('/api/', { id: 1, foo: 'bar' })).to.deep.equal(response);
  });

  it('should make a PATCH request for an entity', async () => {
    const response = { id: 1, foo: 'bar' };
    type T = { id: number, foo: string };

    fetchMock.patch(
      (url, opts) => url === '/api/' && opts.body === JSON.stringify({ foo: 'bar' }),
      response,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(await new FetchClient().patch<T>('/api/', { foo: 'bar' })).to.deep.equal(response);
  });

  it('should make a DELETE request on a collection', async () => {
    const response = { id: 1, foo: 'bar' };
    type T = { id: number, foo: string };

    fetchMock.delete(
      (url, opts) => url === '/api/' && opts.body === JSON.stringify({ id: 1 }),
      response,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(await new FetchClient().delete<T[]>('/api/', { id: 1 })).to.be.undefined;
  });

  it('should make a DELETE request on an entity', async () => {
    type T = { id: number, foo: string };

    fetchMock.delete(
      (url, opts) => url === '/api/' && !opts.body,
      {},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(await new FetchClient().delete<T>('/api/')).to.be.undefined;
  });
});
