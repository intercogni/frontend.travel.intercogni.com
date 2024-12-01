'use client'; 

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
	const { data: session } = useSession();
	const router = useRouter();

	
	const handleDashboardRedirect = () => {
		router.push('/dashboard');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 bg-blobs flex flex-col justify-center items-center text-white relative overflow-hidden">
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-800 to-purple-800 opacity-70"></div>
			<div className="text-center space-y-8 p-6 md:p-12">
				<h1 className="text-4xl font-bold tracking-tight">
					🌍✈️🧳 travel with ease, travel with intercogni
				</h1>
				<p className="text-lg max-w-md mx-auto">
		  			a trip to wherever you want, only a click away
				</p>
		
				{session ? (
					<div className="space-y-4">
						<h2 className="text-2xl">Welcome back, <strong>{session.user.name}</strong>! 👋</h2>
						<button 
							onClick={() => signOut()}
							className="px-6 py-2 bg-gray-800 rounded-full text-lg hover:bg-gray-700 transition duration-300"
						>
							🚪Sign out
						</button>
						<button 
							onClick={handleDashboardRedirect}
							className="ml-4 px-6 py-2 bg-indigo-600 rounded-full text-lg hover:bg-indigo-500 transition duration-300"
						>
							📊 Go to Dashboard
						</button>
					</div>
				) : (
					<div className="space-y-4 flex flex-col items-center">
						<button
							onClick={() => signIn("google")}
							className="px-6 py-2 bg-pink-500 rounded-full text-lg hover:bg-pink-800 transition duration-300 flex items-center"
						>
							<img src="google_icon_512.webp" alt="google_icon" className="w-6 h-6 mr-2" /> 
							<span>Log in with Google</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}