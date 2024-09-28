import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { configApi } from "../../libs/configApi";

export const inboxApiSlice = createApi({
  reducerPath: "inboxApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${configApi.api}`,
    prepareHeaders: (headers) => {
      const token = Cookies.get("authToken");
      console.log(token);
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["quickResponse"],
  refetchOnMountOrArgChange : true,
  endpoints: (builder) => ({
    // Fetch Quick Response Messages
    fetchQuickResMsg: builder.query({
      query: () => "quickResponse/quickres",
      transformResponse: (response) => response?.data,
      providesTags: ["quickResponse"],
    }),

    // Create Quick Response Message
    createQuickResMsg: builder.mutation({
      query: (newMessage) => ({
        url: "quickResponse/quickres",
        method: "POST",
        body: newMessage,
      }),
      invalidatesTags: ["quickResponse"],
    }),

    // Update Quick Response Message
    updateQuickResMsg: builder.mutation({
      query: ({ id, updatedMessage }) => ({
        url: `quickResponse/quickres/${id}`,
        method: "PUT",
        body: updatedMessage,
      }),
      invalidatesTags: ["quickResponse"],
    }),

    // Delete Quick Response Message
    deleteQuickResMsg: builder.mutation({
      query: (id) => ({
        url: `quickResponse/quickres/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["quickResponse"],
    }),
  }),
});

export const {
  useFetchQuickResMsgQuery,
  useCreateQuickResMsgMutation,
  useUpdateQuickResMsgMutation,
  useDeleteQuickResMsgMutation,
} = inboxApiSlice;
