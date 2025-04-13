export default function Loading() {
    return (
        // create a loading spinner
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-1 text-slate-400 text-sm">Loading...</p>
        </div>  
    )
}
