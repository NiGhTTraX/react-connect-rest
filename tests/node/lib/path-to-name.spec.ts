import { describe, it, expect } from '../suite';
import getCollectionNameFromApi from '../../../src/lib/path-to-name';

describe('path-to-name', () => {
  it('should return the last part of the path', () => {
    expect(getCollectionNameFromApi('/foo/bar')).to.equal('bar');
  });

  it('should handle long paths', () => {
    expect(getCollectionNameFromApi('/foo/bar/baz/bax/bag/bat/wat')).to.equal('wat');
  });

  it('should handle trailing slashes', () => {
    expect(getCollectionNameFromApi('/foo/bar/')).to.equal('bar');
  });

  it('should handle malformed paths', () => {
    expect(getCollectionNameFromApi('foobar')).to.equal('foobar');
  });

  it('should handle empty paths', () => {
    expect(getCollectionNameFromApi('')).to.equal('');
  });

  it('should handle paths with query strings', () => {
    expect(getCollectionNameFromApi('/foo?bar=true')).to.equal('foo');
  });

  it('should handle paths with trailing slashes and query strings', () => {
    expect(getCollectionNameFromApi('/foo/?bar=true')).to.equal('foo');
  });

  it('should handle paths with hash', () => {
    expect(getCollectionNameFromApi('/foo#bar')).to.equal('foo');
  });

  it('should handle paths with hash and trailing slashes', () => {
    expect(getCollectionNameFromApi('/foo/#bar')).to.equal('foo');
  });

  it('should handle paths with hash and trailing slashes and query strings', () => {
    expect(getCollectionNameFromApi('/foo/?baz=false#bar')).to.equal('foo');
  });

  it('should handle paths with ports', () => {
    expect(getCollectionNameFromApi('foo:3000/bar')).to.equal('bar');
  });

  it('should handle paths with schemas', () => {
    expect(getCollectionNameFromApi('https://foo/bar')).to.equal('bar');
  });
});
