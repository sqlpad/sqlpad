import chartDefinitions from '../utilities/chartDefinitions';
import exportTo from 'taucharts/dist/plugins/export-to';
import legend from 'taucharts/dist/plugins/legend';
import quickFilter from 'taucharts/dist/plugins/quick-filter';
import tooltip from 'taucharts/dist/plugins/tooltip';
import tcTrendline from 'taucharts/dist/plugins/trendline';
import baseUrl from '../utilities/baseUrl';
import { StatementColumn } from '../types';

/**
 * Caution this uses any type for a few things
 *
 * The chart config is a large object and flexible.
 * TauCharts does not have types defined and likely never will.
 * Additionally data rows are object maps of string keys with any data value.
 * */

interface StringMap {
  [key: string]: string;
}

interface Field {
  fieldId: string;
  required: boolean;
  label: string;
  inputType: string;
}

interface ChartConfiguration {
  chartType: string;
  fields: StringMap;
}

interface DataRow {
  /**
   * Data values for data row are not typed and actually could be any value
   */
  [key: string]: any;
}

const getUnmetFields = (chartType: string, selectedFieldMap: StringMap) => {
  const chartDefinition = chartDefinitions.find(
    (def) => def.chartType === chartType
  );
  if (!chartDefinition) {
    throw new Error(`Unknown chartType ${chartType}`);
  }
  const unmetRequiredFields: Field[] = [];

  chartDefinition.fields.forEach((field) => {
    if (field.required && !selectedFieldMap[field.fieldId]) {
      unmetRequiredFields.push(field);
    }
  });

  return unmetRequiredFields;
};

export default function getTauChartConfig(
  chartConfiguration: ChartConfiguration,
  columns: StatementColumn[] = [],
  rows: any[] = []
) {
  if (!chartConfiguration) {
    return null;
  }

  let dataRows = rows || [];
  const chartType = chartConfiguration.chartType;
  const selectedFields = chartConfiguration.fields;

  if (!chartType || !selectedFields) {
    return null;
  }

  const chartDefinition = chartDefinitions.find(
    (def) => def.chartType === chartType
  );

  if (!dataRows.length || !chartDefinition) {
    return null;
  }

  const chartConfig: any = {
    type: chartDefinition.tauChartsType,
    plugins: [
      tooltip(),
      legend(),
      exportTo({
        cssPaths: [
          // NOTE: We must ref the file in vendor dir for export images to work
          // (we don't know what the webpack bundle css path will be)
          baseUrl() + '/javascripts/vendor/tauCharts/tauCharts.min.css',
        ],
      }),
    ],
    settings: {
      asyncRendering: true,
      renderingTimeout: 10000,
      syncRenderingInterval: 50,
      handleRenderingErrors: true,
      utcTime: true,
    },
  };

  // loop through data rows and convert types as needed
  dataRows = dataRows.map((row: DataRow) => {
    const newRow: DataRow = {};
    columns.forEach((col: StatementColumn) => {
      const { datatype, name } = col;
      if (datatype === 'date' || datatype === 'datetime') {
        newRow[name] = new Date(row[name]);
      } else if (datatype === 'number') {
        newRow[name] = Number(row[name]);
      } else {
        newRow[name] = row[name];
      }
    });

    // HACK -
    // Facets need to be a dimension, not a measure.
    // tauCharts auto detects numbers to be measures
    // Here we'll convert a number to a string,
    // to trick tauCharts into thinking its a dimension
    const forceDimensionFields = chartDefinition.fields.filter(
      (field) => field.forceDimension === true
    );
    forceDimensionFields.forEach((fieldDefinition) => {
      const columnName = selectedFields[fieldDefinition.fieldId];
      const column = columns.find(
        (column: StatementColumn) => column.name === columnName
      );
      const colDatatype = column ? column.datatype : null;
      if (columnName && colDatatype === 'number' && newRow[columnName]) {
        newRow[columnName] = newRow[columnName].toString();
      }
    });
    return newRow;
  });

  // Some chartConfiguration.fields may reference columns that no longer exist
  // Remove them from a copy of chartConfigurationFields
  // Unless they aren't column mapping fields (like trendline, quickfilter)
  const cleanedChartConfigurationFields = Object.keys(
    chartConfiguration.fields
  ).reduce((fieldsMap: StringMap, fieldColName) => {
    const fieldDefinition = chartDefinition.fields.find(
      (f) => f.fieldId === fieldColName
    );
    const columnName = chartConfiguration.fields[fieldColName];

    if (fieldDefinition && fieldDefinition.inputType !== 'field-dropdown') {
      fieldsMap[fieldColName] = columnName;
    } else if (columns.find((c: StatementColumn) => c.name === columnName)) {
      fieldsMap[fieldColName] = columnName;
    }
    return fieldsMap;
  }, {});

  // Now that non-existing columns are removed from the configuration fields
  // Validate that the chart required fields are provided
  const unmetFields = getUnmetFields(
    chartType,
    cleanedChartConfigurationFields
  );

  if (unmetFields.length) {
    // TODO - highlight fields that are required but not provided or clear values no longer relevant
    // message.error(
    //   'Unmet required fields: ' + unmetFields.map(f => f.label).join(', ')
    // );
    return null;
  }

  const {
    x,
    xFacet,
    y,
    yFacet,
    filter,
    trendline,
    split,
    size,
    yMin,
    yMax,
    barvalue,
    valueFacet,
    barlabel,
    labelFacet,
    color,
  } = cleanedChartConfigurationFields;

  switch (chartType) {
    case 'line':
      chartConfig.x = [x];
      if (xFacet) {
        chartConfig.x.unshift(xFacet);
      }
      chartConfig.y = [y];
      if (yFacet) {
        chartConfig.y.unshift(yFacet);
      }
      if (filter) {
        chartConfig.plugins.push(quickFilter());
      }
      if (trendline) {
        chartConfig.plugins.push(tcTrendline());
      }
      if (split) {
        chartConfig.color = split;
      }
      if (size) {
        chartConfig.size = size;
      }
      if (yMin || yMax) {
        chartConfig.guide = {
          y: { autoScale: false },
        };
        if (yMin) {
          chartConfig.guide.y.min = Number(yMin);
        }
        if (yMax) {
          chartConfig.guide.y.max = Number(yMax);
        }
      }
      break;

    case 'bar':
      chartConfig.x = [barvalue];
      if (valueFacet) {
        chartConfig.x.unshift(valueFacet);
      }
      chartConfig.y = [barlabel];
      if (labelFacet) {
        chartConfig.y.unshift(labelFacet);
      }
      break;

    case 'verticalbar':
      chartConfig.y = [barvalue];
      if (valueFacet) {
        chartConfig.y.unshift(valueFacet);
      }
      chartConfig.x = [barlabel];
      if (labelFacet) {
        chartConfig.x.unshift(labelFacet);
      }
      break;

    case 'stacked-bar-horizontal':
      chartConfig.x = [barvalue];
      if (valueFacet) {
        chartConfig.x.unshift(valueFacet);
      }
      chartConfig.y = [barlabel];
      if (labelFacet) {
        chartConfig.y.unshift(labelFacet);
      }
      if (color) {
        chartConfig.color = color;
      }
      break;

    case 'stacked-bar-vertical':
      chartConfig.y = [barvalue];
      if (valueFacet) {
        chartConfig.y.unshift(valueFacet);
      }
      chartConfig.x = [barlabel];
      if (labelFacet) {
        chartConfig.x.unshift(labelFacet);
      }
      if (color) {
        chartConfig.color = color;
      }
      break;

    case 'bubble':
      chartConfig.x = [x];
      if (xFacet) {
        chartConfig.x.unshift(xFacet);
      }
      chartConfig.y = [y];
      if (yFacet) {
        chartConfig.y.unshift(yFacet);
      }
      if (filter) {
        chartConfig.plugins.push(quickFilter());
      }
      if (trendline) {
        chartConfig.plugins.push(tcTrendline());
      }
      if (size) {
        chartConfig.size = size;
      }
      if (color) {
        chartConfig.color = color;
      }
      break;

    default:
      console.error('unknown chart type');
  }

  // Add data to chart chartConfig
  chartConfig.data = dataRows;

  return chartConfig;
}
