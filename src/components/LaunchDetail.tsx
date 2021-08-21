import { PastLaunchesQuery } from "../generated/graphql";
import { classNames } from "../utils";

const LaunchDetail: React.FC<{
  launchItem: NonNullable<PastLaunchesQuery["launchesPast"]>[0];
}> = ({ launchItem }) => {
  return (
    <div className="flex flex-col h-auto w-full bg-gray-50">
      <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="-ml-4 -mt-4 flex justify-between items-center flex-wrap">
          <div className="ml-4 mt-4">
            <div>
              {typeof launchItem?.launch_success === "boolean" && (
                <span
                  className={classNames(
                    "inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ",
                    launchItem?.launch_success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  🚀 {launchItem?.launch_success ? "Succeeded" : "Failed"}
                </span>
              )}
              <h1 className="text-2xl mt-1 leading-6 font-medium text-gray-900">
                {launchItem?.mission_name}
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Launch Date:
              <time dateTime={launchItem?.launch_date_local}>
                {new Date(launchItem?.launch_date_local).toLocaleString()}
              </time>
            </p>
          </div>
          <div className="ml-4 mt-4 flex-shrink-0">
            {launchItem?.links?.wikipedia && (
              <a
                target="_blank"
                rel="noreferrer noopener"
                href={launchItem.links.wikipedia}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Wikipedia
                <svg
                  className="ml-2 -mr-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z"></path>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 flex flex-col gap-2 mt-4">
        <p className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
          Launch Site
        </p>
        <h3 className=" text-xl font-extrabold text-gray-900">
          {launchItem?.launch_site?.site_name_long}
        </h3>
        <p className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
          Rocket
        </p>
        <h3 className=" text-xl font-extrabold text-gray-900">
          {launchItem?.rocket?.rocket_name}
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 ">
          <div className="sm:col-span-1">
            <dt className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              First Stage
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              <pre>
                {JSON.stringify(
                  launchItem?.rocket?.first_stage?.cores,
                  null,
                  2
                )}
              </pre>
            </dd>
          </div>

          <div className="sm:col-span-1">
            <dt className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Second Stage
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              <pre>
                {JSON.stringify(
                  launchItem?.rocket?.second_stage?.payloads,
                  null,
                  1
                )}
              </pre>
            </dd>
          </div>
        </dl>

        {(launchItem?.ships ?? []).length > 0 && (
          <>
            <p className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Ships
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {launchItem?.ships?.map((ship) => (
                <li
                  className="relative"
                  key={ship?.id}
                  title={ship?.name || ""}
                >
                  {ship?.image && (
                    <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg  overflow-hidden">
                      <img
                        src={ship.image}
                        alt={ship?.name || ""}
                        className=" object-cover pointer-events-none"
                      />
                    </div>
                  )}
                  <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                    {ship?.name}
                  </p>
                  <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                    {ship?.home_port}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export { LaunchDetail as default };
