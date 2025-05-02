export default function Loading() {
    return (
        // create a loading spinner
        <div className="flex flex-col justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-red-500"></div>
            <p className="mt-4 text-slate-500 text-sm font-medium">Darla Stores Loading...</p>
            <p className="mt-2 text-red-400 text-sm max-w-md">
              On the first load, it may take a few seconds. Please wait or check our{" "}
              <a href="https://www.linkedin.com/posts/uday-kiran-darla_fullstackdevelopment-webdevelopment-ecommerceapp-activity-7322843326972383232-n9tw?utm_source=share&utm_medium=member_desktop&rcm=ACoAADtVFfoBZNk6Ydwke0gPeHqIlhCag7pIb0Y" className="underline text-blue-500 hover:text-blue-700 transition">
                walkthrough video
              </a>.
            </p>
        </div>  
    )
}
