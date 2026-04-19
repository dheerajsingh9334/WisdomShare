import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedConversation: null,
  messageDraft: "",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    clearSelectedConversation: (state) => {
      state.selectedConversation = null;
    },
    setMessageDraft: (state, action) => {
      state.messageDraft = action.payload;
    },
    clearMessageDraft: (state) => {
      state.messageDraft = "";
    },
  },
});

export const {
  setSelectedConversation,
  clearSelectedConversation,
  setMessageDraft,
  clearMessageDraft,
} = chatSlice.actions;

export default chatSlice.reducer;
