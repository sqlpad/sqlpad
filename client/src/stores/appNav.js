export const initialState = {
  showSchema: true,
  showVisSidebar: false
};

export function toggleSchema(state) {
  return {
    showSchema: !state.showSchema,
    showVisSidebar: false
  };
}

export function toggleVisSidebar(state) {
  return {
    showVisSidebar: !state.showVisSidebar,
    showSchema: false
  };
}

export default { initialState, toggleSchema, toggleVisSidebar };
