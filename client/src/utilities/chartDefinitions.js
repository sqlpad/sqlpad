const chartDefinitions = [
  {
    chartType: 'line',
    tauChartsType: 'line',
    chartLabel: 'Line',
    fields: [
      {
        fieldId: 'x',
        required: true,
        label: 'x',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'y',
        required: true,
        label: 'y',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'split',
        required: false,
        label: 'color / line for each',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'size',
        required: false,
        label: 'size',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'xFacet',
        requied: false,
        label: 'x Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'yFacet',
        required: false,
        label: 'y Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'filter',
        required: false,
        label: 'Quick Filter',
        inputType: 'checkbox',
        advanced: true
      },
      {
        fieldId: 'trendline',
        required: false,
        label: 'Show Trendline',
        inputType: 'checkbox',
        advanced: true
      },
      {
        fieldId: 'yMin',
        required: false,
        label: 'y Axis Min',
        inputType: 'textbox',
        advanced: true
      },
      {
        fieldId: 'yMax',
        required: false,
        label: 'y Axis Max',
        inputType: 'textbox',
        advanced: true
      }
    ]
  },
  {
    chartType: 'bar',
    tauChartsType: 'horizontalBar',
    chartLabel: 'Bar - Horizontal',
    fields: [
      {
        fieldId: 'barlabel',
        required: true,
        label: 'Bar Label',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'barvalue',
        required: true,
        label: 'Bar Value',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'labelFacet',
        required: false,
        label: 'Bar Label Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'valueFacet',
        required: false,
        label: 'Bar Value Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      }
    ]
  },
  {
    chartType: 'verticalbar',
    tauChartsType: 'bar',
    chartLabel: 'Bar - Vertical',
    fields: [
      {
        fieldId: 'barlabel',
        required: true,
        label: 'Bar Label',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'barvalue',
        required: true,
        label: 'Bar Value',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'labelFacet',
        required: false,
        label: 'Bar Label Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'valueFacet',
        required: false,
        label: 'Bar Value Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      }
    ]
  },
  {
    chartType: 'bubble',
    tauChartsType: 'scatterplot',
    chartLabel: 'Scatterplot',
    fields: [
      {
        fieldId: 'x',
        label: 'x Axis',
        inputType: 'field-dropdown',
        required: true
      },
      {
        fieldId: 'y',
        label: 'y Axis',
        inputType: 'field-dropdown',
        required: true
      },
      {
        fieldId: 'size',
        label: 'Size',
        inputType: 'field-dropdown',
        required: false
      },
      {
        fieldId: 'color',
        label: 'Color',
        inputType: 'field-dropdown',
        required: false
      },
      {
        fieldId: 'xFacet',
        requied: false,
        label: 'x Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'yFacet',
        required: false,
        label: 'y Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'filter',
        required: false,
        label: 'Quick Filter',
        inputType: 'checkbox',
        advanced: true
      },
      {
        fieldId: 'trendline',
        required: false,
        label: 'Show Trendline',
        inputType: 'checkbox',
        advanced: true
      }
    ]
  },
  {
    chartType: 'stacked-bar-vertical',
    tauChartsType: 'stacked-bar',
    chartLabel: 'Stacked Bar - Vertical',
    fields: [
      {
        fieldId: 'barlabel',
        required: true,
        label: 'Bar Label',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'barvalue',
        required: true,
        label: 'Bar Value',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'color',
        label: 'Color',
        inputType: 'field-dropdown',
        required: false
      },
      {
        fieldId: 'labelFacet',
        required: false,
        label: 'Bar Label Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'valueFacet',
        required: false,
        label: 'Bar Value Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      }
    ]
  },
  {
    chartType: 'stacked-bar-horizontal',
    tauChartsType: 'horizontal-stacked-bar',
    chartLabel: 'Stacked Bar - Horizontal',
    fields: [
      {
        fieldId: 'barlabel',
        required: true,
        label: 'Bar Label',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'barvalue',
        required: true,
        label: 'Bar Value',
        inputType: 'field-dropdown'
      },
      {
        fieldId: 'color',
        label: 'Color',
        inputType: 'field-dropdown',
        required: false
      },
      {
        fieldId: 'labelFacet',
        required: false,
        label: 'Bar Label Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      },
      {
        fieldId: 'valueFacet',
        required: false,
        label: 'Bar Value Facet',
        inputType: 'field-dropdown',
        forceDimension: true
      }
    ]
  }
];

export default chartDefinitions;
