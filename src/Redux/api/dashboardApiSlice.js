import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { configApi } from "../../libs/configApi";

export const dashboardApiSlice = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${configApi.api}`,
    prepareHeaders: (headers) => {
      const token = Cookies.get("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["designer"],

  endpoints: (builder) => ({
    allProjectStatus: builder.query({
      query: () => "find-order/project-status",
      transformResponse: (response) => response?.data,
    }),

    getAllProjects: builder.query({
      query: ({ status }) => `find-order?projectStatus=${status}`,
      transformResponse: (response) => response?.data,
      providesTags: ["designer"],
    }),

    addDesigner: builder.mutation({
      query: ({ designerName, orderId }) => ({
        url: `find-order/update-designer-name/${orderId}`,
        method: "PATCH",
        body: { designerName },
      }),
      invalidatesTags: ["designer"],
    }),

    getProjectsStats: builder.query({
      query: ({ timeFilter }) =>
        `find-order/order-count?timeFilter=${timeFilter}`,
      transformResponse: (response) => response?.data,
    }),
  }),
});

export const {
  useAllProjectStatusQuery,
  useLazyGetAllProjectsQuery,
  useGetProjectsStatsQuery,
  useAddDesignerMutation,
  useLazyGetProjectsStatsQuery,
} = dashboardApiSlice;
