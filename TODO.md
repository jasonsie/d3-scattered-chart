# TODO

## Canvas & Polygon Layer Improvements
- 0. apply Transition options to each data dot when rendering (Chart.tsx line 166)
- 1. dot color should be slight opacity
- 2. color of the selected dot should be different from unselected dot (Chart.tsx line 174)
- 3. remove the colour for polygon layer (Chart.tsx line 174)

## Sidebar Enhancements
- 1. Add a color picker for dot color in the sidebar (Sidebar.tsx)
  -  https://motion.dev/examples/react-color-picker
- 2. Selection Summary
- 3. Changing Name from clicking on the title 
- 4. Table view
  -  Add Title
  -  dropdown with the total of data
     ```typescript
     type TableViewProps =
      {
        "selectedPoints": number
        "percentageSelected": number
        "selected_props_1": number
        "selected_props_2": number
      }
     ```

## Feat: Dynamic Axis Selection
### specification
  Here is a new requirement, that the x-axis and y-axis can be changed dynamically from the sidebar.
  - 1. Sidebar Controls
    - Requirement: Add dropdown menus in the sidebar to select which data properties to use for the x-axis and y-axis.
  - 2. Chart Updates
    - Update the chart to re-render based on the selected axes.
    - Update the axis labels to reflect the selected axes.
    - Update the unit of measurement of the chart based on the selected axes.
  Please help me implement these features in the same spec
### plan
  0. State Managemenmt: Using Contexts state to store the unit measurement, selected x-axis and y-axis properties.
  1. components:
      1. dropdown for x-axis and y-axis selection in the sidebar
        - Dropdown Options: Populate the dropdowns with the available data properties (e.g., "prop_1", "prop_2", etc.); the default selections should be "CD45-KrO" for the x-axis and "SS INT LIN" for the y-axis.
        - Dropdown Functionality: When a user selects a different property from the dropdown, update the chart to reflect the new axis selection.
        - Dropdown component: refer to mui, 'https://codesandbox.io/embed/6hpdvn?module=/src/Demo.tsx&fontsize=12'
      2. Update Chart Component:
        - Axis Scaling: Use D3 scales to map the selected data properties to the chart's pixel dimensions.
        - Axis Labels: Dynamically update the axis labels based on the selected properties.
        - Data Binding: Ensure that the data points are correctly bound to the new axes and re-rendered accordingly. 
      3. Update Unit of Measurement Control:
        - When the user changes the unit of measurement from the sidebar control, update the chart scales and re-render the chart accordingly.
        - component refer to this example: 'https://codesandbox.io/embed/7tvlj7?module=/src/Demo.tsx&fontsize=12' 
      4. Loading component
       - modualize the loading component for the whole app 
       - state management: adding a loading state to a new and the most outer context provider 'GlobalContext'
       - component refer to 'plant circles' in this example: 'https://codepen.io/esdesignstudio/pen/RwQdEZb' 

## Modify
1. Data (state)
   - Measurement unit state
      - Slider, 100, 200, 400 ..... 2000 
      - Chart: unit doesn't reach 2000 and it should be 100, 200..... also
      - Once slider units is changed, the data dot doesn't respond to it
2. Layout
  - Layout for chart: the Y- axis - text - displaying is out of layout
  - Layout for dropdown: Text color: white

  



## Refactor: Sidebar Table

