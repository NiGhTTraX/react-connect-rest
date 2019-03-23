import { RestResponse } from '../../../../src/lib/http-rest-client';

export interface Author {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  author: Author;
}

export interface Book {
  id: number;
  authors: Author[];
}

export interface ArrayModel {
  id: number;
  numbers: number[];
}

export const postResponse: RestResponse<Post> = {
  data: {
    __links: { author: ':author-api:' },
    id: 1,
    author: 1
  }
};

export const postsResponse: RestResponse<Post[]> = {
  data: [{
    __links: { author: ':author-api:' },
    id: 1,
    author: 1
  }]
};

export const bookResponse: RestResponse<Book> = {
  data: {
    __links: { authors: ':author-api:' },
    id: 1,
    authors: [1]
  }
};

export const booksResponse: RestResponse<Book[]> = {
  data: [{
    __links: { authors: ':author-api:' },
    id: 1,
    authors: [1]
  }]
};

export const authorResponse: RestResponse<Author> = {
  data: {
    __links: [],
    id: 1,
    name: 'author 1'
  }
};

export const authorsResponse: RestResponse<Author[]> = {
  data: [{
    __links: [],
    id: 1,
    name: 'author 1'
  }]
};
