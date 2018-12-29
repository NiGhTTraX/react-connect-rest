import React, { Component } from 'react';
import { RestViewProps } from '../../src/rest-store';
import connectToRest from '../../src/connect';

interface CategoryModel {
  id: number;
  title: string;
}

class CategoryList extends Component<RestViewProps<CategoryModel>> {
  render() {
    return <ul>
      {this.props.data.map(category => <li key={category.id}>
        {category.title}
      </li>)}
    </ul>;
  }
}

export default {
  component: connectToRest(CategoryList, '/some/api/category'),
  fetch: [{
    matcher: '/some/api/category',
    response: [{
      id: 1,
      title: 'some category'
    }]
  }]
};
