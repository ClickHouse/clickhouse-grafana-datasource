import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderByEditor, getOrderByFields } from './OrderByEditor';
import { AggregateType, BuilderMode, ColumnHint, OrderByDirection, QueryType, TableColumn } from 'types/queryBuilder';

const newTestColumn = (name: string): TableColumn => ({
  name,
  sortable: true,
  type: 'String',
  picklistValues: []
});

const testColumns: TableColumn[] = [
  newTestColumn('foo'),
  newTestColumn('bar'),
  newTestColumn('baz'),
];

describe('OrderByEditor', () => {
  it('should render null when no fields passed', () => {
    const result = render(<OrderByEditor allColumns={[]} orderBy={[]} onOrderByChange={() => {}} />);
    expect(result.container.firstChild).toBeNull();
  });
  it('should render component when fields passed', () => {
    const result = render(
      <OrderByEditor allColumns={[testColumns[0]]} orderBy={[]} onOrderByChange={() => {}} />
    );
    expect(result.container.firstChild).not.toBeNull();
  });
  it('should render default add button when no orderby fields passed', () => {
    const result = render(
      <OrderByEditor allColumns={[testColumns[0]]} orderBy={[]} onOrderByChange={() => {}} />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('query-builder-orderby-add-button')).toBeInTheDocument();
    expect(result.queryByTestId('query-builder-orderby-item-wrapper')).not.toBeInTheDocument();
    expect(result.queryByTestId('query-builder-orderby-remove-button')).not.toBeInTheDocument();
  });
  it('should render remove button when at least one orderby fields passed', () => {
    const result = render(
      <OrderByEditor
        allColumns={[testColumns[0]]}
        orderBy={[{ name: 'foo', dir: OrderByDirection.ASC }]}
        onOrderByChange={() => {}}
      />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('query-builder-orderby-add-button')).toBeInTheDocument();
    expect(result.getByTestId('query-builder-orderby-item-wrapper')).toBeInTheDocument();
    expect(result.getByTestId('query-builder-orderby-remove-button')).toBeInTheDocument();
  });
  it('should render add/remove buttons correctly when multiple orderby elements passed', () => {
    const result = render(
      <OrderByEditor
        allColumns={[testColumns[0]]}
        orderBy={[
          { name: 'foo', dir: OrderByDirection.ASC },
          { name: 'bar', dir: OrderByDirection.ASC },
        ]}
        onOrderByChange={() => {}}
      />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(result.queryByTestId('query-builder-orderby-add-button')).toBeInTheDocument();
    expect(result.getAllByTestId('query-builder-orderby-item-wrapper').length).toBe(2);
    expect(result.getAllByTestId('query-builder-orderby-remove-button').length).toBe(2);
  });
  it('should render label only once', () => {
    const result = render(
      <OrderByEditor
        allColumns={[testColumns[0]]}
        orderBy={[
          { name: 'foo', dir: OrderByDirection.ASC },
          { name: 'bar', dir: OrderByDirection.ASC },
        ]}
        onOrderByChange={() => {}}
      />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('query-builder-orderby-item-label')).toBeInTheDocument();
  });
  it('should add default item when add button clicked', async () => {
    const onOrderByChange = jest.fn();
    const result = render(
      <OrderByEditor
        allColumns={[testColumns[0]]}
        orderBy={[]}
        onOrderByChange={onOrderByChange}
      />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(result.getByTestId('query-builder-orderby-add-button')).toBeInTheDocument();
    expect(result.queryByTestId('query-builder-orderby-item-wrapper')).not.toBeInTheDocument();
    expect(result.queryByTestId('query-builder-orderby-remove-button')).not.toBeInTheDocument();
    expect(onOrderByChange).toBeCalledTimes(0);
    await userEvent.click(result.getByTestId('query-builder-orderby-add-button'));
    expect(onOrderByChange).toBeCalledTimes(1);
    expect(onOrderByChange).toBeCalledWith([{ name: 'foo', dir: OrderByDirection.ASC }]);
  });
  it('should add and remove items when remove button clicked', async () => {
    const onOrderByChange = jest.fn();
    const result = render(
      <OrderByEditor
        allColumns={testColumns}
        orderBy={[
          { name: 'foo', dir: OrderByDirection.ASC },
          { name: 'bar', dir: OrderByDirection.ASC },
        ]}
        onOrderByChange={onOrderByChange}
      />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(onOrderByChange).toBeCalledTimes(0);
    await userEvent.click(result.getAllByTestId('query-builder-orderby-remove-button')[1]);
    await userEvent.click(result.getAllByTestId('query-builder-orderby-remove-button')[0]);
    await userEvent.click(result.getAllByTestId('query-builder-orderby-add-button')[0]);
    expect(onOrderByChange).toBeCalledTimes(3);
    expect(onOrderByChange).toHaveBeenNthCalledWith(1, [{ name: 'foo', dir: OrderByDirection.ASC }]);
    expect(onOrderByChange).toHaveBeenNthCalledWith(2, [{ name: 'bar', dir: OrderByDirection.ASC }]);
    expect(onOrderByChange).toHaveBeenNthCalledWith(3, [
      { name: 'foo', dir: OrderByDirection.ASC },
      { name: 'bar', dir: OrderByDirection.ASC },
      { name: 'foo', dir: OrderByDirection.ASC },
    ]);
  });
});

describe('getOrderByFields', () => {
  const sampleFields = [
    {
      name: 'field1',
      label: 'field1',
      type: 'string',
      picklistValues: [],
    },
    {
      name: 'field11',
      label: 'field11',
      type: 'string',
      picklistValues: [],
    },
    {
      name: 'field2',
      label: 'field2',
      type: 'string',
      picklistValues: [],
    },
    {
      name: 'field3',
      label: 'field3',
      type: 'string',
      picklistValues: [],
    },
  ];
  it('list view', () => {
    expect(
      getOrderByFields(
        {
          database: 'db',
          table: 'foo',
          queryType: QueryType.Table,
          mode: BuilderMode.List,
          columns: [{ name: 'field1' }, { name: 'field3' }],
        },
        sampleFields
      )
    ).toStrictEqual([
      {
        label: 'field1',
        value: 'field1',
      },
      {
        label: 'field11',
        value: 'field11',
      },
      {
        label: 'field2',
        value: 'field2',
      },
      {
        label: 'field3',
        value: 'field3',
      },
    ]);
  });
  it('aggregated view - no group by and no aggregates', () => {
    expect(
      getOrderByFields(
        {
          database: 'db',
          table: 'foo',
          queryType: QueryType.Table,
          mode: BuilderMode.Aggregate,
          columns: [],
          aggregates: [],
        },
        sampleFields
      )
    ).toStrictEqual([]);
  });
  it('aggregated view - no group by and with two aggregates', () => {
    expect(
      getOrderByFields(
        {
          database: 'db',
          table: 'foo',
          queryType: QueryType.Table,
          mode: BuilderMode.Aggregate,
          columns: [],
          aggregates: [
            { column: 'field2', aggregateType: AggregateType.Max },
            { column: 'field1', aggregateType: AggregateType.Sum },
          ],
        },
        sampleFields
      )
    ).toStrictEqual([
      {
        value: 'max(field2)',
        label: 'max(field2)',
      },
      {
        value: 'sum(field1)',
        label: 'sum(field1)',
      },
    ]);
  });
  it('aggregated view - two group by and with no aggregates', () => {
    expect(
      getOrderByFields(
        {
          database: 'db',
          table: 'foo',
          queryType: QueryType.Table,
          mode: BuilderMode.Aggregate,
          columns: [],
          aggregates: [],
          groupBy: ['field3', 'field1'],
        },
        sampleFields
      )
    ).toStrictEqual([
      {
        value: 'field3',
        label: 'field3',
      },
      {
        value: 'field1',
        label: 'field1',
      },
    ]);
  });
  it('aggregated view - two group by and with two metrics', () => {
    expect(
      getOrderByFields(
        {
          database: 'db',
          table: 'foo',
          queryType: QueryType.Table,
          mode: BuilderMode.Aggregate,
          columns: [],
          aggregates: [
            { column: 'field2', aggregateType: AggregateType.Max },
            { column: 'field1', aggregateType: AggregateType.Sum },
          ],
          groupBy: ['field3', 'field1'],
        },
        sampleFields
      )
    ).toStrictEqual([
      {
        value: 'max(field2)',
        label: 'max(field2)',
      },
      {
        value: 'sum(field1)',
        label: 'sum(field1)',
      },
      {
        value: 'field3',
        label: 'field3',
      },
      {
        value: 'field1',
        label: 'field1',
      },
    ]);
  });
  it('trend view', () => {
    expect(
      getOrderByFields(
        {
          database: 'db',
          table: 'foo',
          queryType: QueryType.Table,
          mode: BuilderMode.Trend,
          columns: [{ name: 'field3', type: 'datetime', hint: ColumnHint.Time }],
          aggregates: [{ column: 'field2', aggregateType: AggregateType.Max }],
        },
        sampleFields
      )
    ).toStrictEqual([
      {
        label: 'field1',
        value: 'field1',
      },
      {
        label: 'field11',
        value: 'field11',
      },
      {
        label: 'field2',
        value: 'field2',
      },
      {
        label: 'field3',
        value: 'field3',
      },
    ]);
  });
});
