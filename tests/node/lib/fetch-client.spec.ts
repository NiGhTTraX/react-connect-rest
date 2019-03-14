import fetchMock from 'fetch-mock';
import { describe, expect, it } from '../suite';
import FetchClient from '../../../src/lib/fetch-client';

describe('FetchClient', () => {
  it('should make a GET request', async () => {
    fetchMock.get('/api/', true);

    expect(await FetchClient.get<boolean>('/api/')).to.be.true;
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

    expect(await FetchClient.set<T>('/api/', { foo: 'bar' })).to.deep.equal(response);
  });

  it('should make a PATCH request', async () => {
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

    expect(await FetchClient.update<T>('/api/', { foo: 'bar' })).to.deep.equal(response);
  });

  it('should make a DELETE request', async () => {
    const response = { id: 1, foo: 'bar' };
    type T = { id: number, foo: string };

    fetchMock.delete(
      (url, opts) => url === '/api/' && opts.body === JSON.stringify({ foo: 'bar' }),
      response,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(await FetchClient.delete<T>('/api/', { foo: 'bar' })).to.be.undefined;
  });
});
