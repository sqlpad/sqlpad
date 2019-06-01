export const initialState = {
  showSchema: false
};

export function toggleSchema(state) {
  return {
    showSchema: !state.showSchema
  };
}

export default { initialState, toggleSchema };
