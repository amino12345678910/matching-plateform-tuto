export default function NoServicesFound() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9V5.25m4.5 3.75V5.25M3.75 19.5h16.5m-1.5 0V11.25A2.25 2.25 0 0016.5 9h-9a2.25 2.25 0 00-2.25 2.25V19.5m3-10.5h6"
          />
        </svg>
      </div>

      <h2 className="mt-6 text-lg font-semibold text-gray-900">No Tutoring Sessions Found</h2>

      <p className="mt-2 text-sm text-gray-500 max-w-xs">
        Try adjusting your subject filters or check back soon for new tutors.
      </p>
    </div>
  );
}
