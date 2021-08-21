import { ChangeEvent, useEffect } from "react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import {
  PastLaunchesQueryVariables,
  usePastLaunchesQuery,
} from "../generated/graphql";
import useDebounce from "../hooks/useDebounce";
import { useScrollToBottom } from "use-scroll-to-bottom";
import { classNames } from "../utils";
import LaunchDetail from "../components/LaunchDetail";

const InitialDetailViewRender = (
  <>
    <h1 className="text-center text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mt-2">
      Welcome to SpaceX Launch Wiki!
    </h1>
    <p className="text-sm font-medium text-gray-500 space-y-4">
      Please select a launch mission to view its details
    </p>
  </>
);

const SearchIcon = (
  <svg
    className="h-5 w-5 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const DEFAULT_QUERY_VARIABLES = {
  limit: 10,
  offset: 0,
};

const Home: React.FC = () => {
  const queryClient = useQueryClient();
  const [setBottomRef, isBottom] = useScrollToBottom();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [searchOption, setSearchOption] = useState("rocket_name");
  const [queryOffset, setQueryOffset] = useState(0);
  const [queryVariables, setQueryVariables] =
    useState<PastLaunchesQueryVariables>(DEFAULT_QUERY_VARIABLES);
  const { data, isLoading, isError, error } = usePastLaunchesQuery(
    queryVariables,
    { keepPreviousData: true, staleTime: 5000 }
  );
  const [activeLaunchItem, setActiveLaunchItem] = useState(
    data?.launchesPast?.[0]
  );
  const [compareWindow, setCompareWindow] = useState<typeof activeLaunchItem[]>(
    []
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (typeof debouncedSearchTerm === "string") {
      setQueryVariables({
        ...DEFAULT_QUERY_VARIABLES,
        find: {
          [searchOption]: debouncedSearchTerm,
        },
      });
      setQueryOffset(0);
    }
  }, [debouncedSearchTerm, searchOption]);

  useEffect(() => {
    if (isBottom) {
      fetchMore();
    }
    async function fetchMore() {
      const currentQueryKey = usePastLaunchesQuery.getKey(queryVariables);
      const newQueryVariables = {
        ...queryVariables,
        limit: DEFAULT_QUERY_VARIABLES.limit,
        offset: queryOffset + DEFAULT_QUERY_VARIABLES.limit,
      };
      const newQueryKey = usePastLaunchesQuery.getKey(newQueryVariables);
      const nextData: typeof data = await queryClient.fetchQuery(newQueryKey, {
        queryFn: usePastLaunchesQuery.fetcher(newQueryVariables),
      });
      queryClient.setQueryData(currentQueryKey, (oldData: typeof data) => {
        return {
          launchesPast: [
            ...(oldData?.launchesPast ?? []),
            ...(nextData?.launchesPast ?? []),
          ],
        };
      });
      setQueryOffset(
        (prevOffset) => prevOffset + DEFAULT_QUERY_VARIABLES.limit
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom, queryClient]);

  const onSelectionChange = (
    e: ChangeEvent<HTMLInputElement>,
    launch: typeof activeLaunchItem
  ) => {
    const action = e.target.checked ? "insertion" : "removal";
    if (launch && compareWindow && action === "removal") {
      setCompareWindow(
        compareWindow.filter((window) => window?.id !== launch.id)
      );
      return;
    }
    const MAX_LIMIT = 2;
    const isWindowAtMaxLimit = Object.keys(compareWindow).length === MAX_LIMIT;
    if (isWindowAtMaxLimit) {
      setCompareWindow((prevWindow) => [prevWindow[1], launch]);
    } else {
      setCompareWindow((prevWindow) => [...prevWindow, launch]);
    }
  };

  if (isError) {
    console.error(error);
    return <p>Something went wrong.</p>;
  }

  const { launchesPast = [] } = data ?? {};
  const noLaunchesFound = launchesPast?.length === 0;
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col gap-4 min-h-screen">
      <div className="flex gap-2">
        <div className="flex flex-col max-h-screen w-96">
          <div className="flex gap-1">
            <div className="p-4 w-72">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  {SearchIcon}
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search"
                  type="search"
                  autoFocus
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center m-0.5 rounded-md bg-gray-100">
                  <label htmlFor="search_by" className="sr-only">
                    by
                  </label>
                  <select
                    id="search_by"
                    name="search_by"
                    className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-2 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md "
                    onChange={(e) => setSearchOption(e.target.value)}
                  >
                    <option value="rocket_name">Rocket</option>
                    <option value="mission_name">Mission</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 disabled:opacity-50"
                disabled={compareWindow.length !== 2}
                onClick={() => setIsModalVisible(true)}
              >
                Compare
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-200 overflow-y-auto">
            {launchesPast?.map((launch, i) => {
              const attachRefIfLast =
                i === launchesPast.length - 1 ? { ref: setBottomRef } : {};
              return (
                <li key={launch?.id} {...attachRefIfLast}>
                  <button
                    className={classNames(
                      "hover:bg-gray-50 flex text-left p-4 w-full",
                      activeLaunchItem?.id === launch?.id
                        ? "ring-2 ring-inset ring-indigo-600"
                        : ""
                    )}
                    onClick={() => setActiveLaunchItem(launch)}
                  >
                    <div className="min-w-0 flex-1 text-sm">
                      <label
                        htmlFor={`mission-${activeLaunchItem?.id}`}
                        className="font-medium text-gray-700 select-none"
                      >
                        {launch?.mission_name}
                      </label>
                    </div>
                    <div className="ml-3 flex items-center h-5">
                      <input
                        id={`mission-${activeLaunchItem?.id}`}
                        name={`mission-${activeLaunchItem?.id}`}
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={
                          compareWindow.filter(
                            (window) => window!.id === launch!.id
                          ).length > 0
                        }
                        onChange={(e) => onSelectionChange(e, launch)}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
            {isLoading && (
              <li>
                <p className="flex p-4 w-full">Loading...</p>
              </li>
            )}
            {noLaunchesFound && !isLoading && (
              <li>
                <p className="flex p-4 w-full">
                  No launches found. Refine your search.
                </p>
              </li>
            )}
          </ul>
        </div>
        <div className="flex flex-grow flex-col justify-start items-center min-h-screen bg-gray-50 relative">
          {activeLaunchItem ? (
            <LaunchDetail launchItem={activeLaunchItem} />
          ) : (
            InitialDetailViewRender
          )}
          {isModalVisible && (
            <div className="flex w-full absolute left-0 top-0 p-2.5 bg-black bg-opacity-60 overflow-y-auto overflow-x-hidden min-h-screen">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsModalVisible(false)}
                >
                  <span className="sr-only">Close Modal</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <LaunchDetail launchItem={compareWindow[0]!} />
              <LaunchDetail launchItem={compareWindow[1]!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Home as default };
