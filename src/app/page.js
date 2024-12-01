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
		<div className="min-h-screen flex flex-col justify-center items-center text-white relative overflow-hidden">
			<video 
				autoPlay 
				loop 
				muted 
				className="absolute inset-0 w-full h-full object-cover -z-10"
			>
				<source src="homepage_background_video.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</video>
			<div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-800 to-pink-800 opacity-50"></div>
			<div className="text-center space-y-8 p-6 md:p-12">
				<h1 className="text-4xl font-bold tracking-tight">
					🌍✈️🧳 travel with ease, travel with intercogni
				</h1>
				<p className="text-lg max-w-md mx-auto">
					a trip to wherever you want, only a click away
				</p>
		
				{session ? (
					<div className="space-y-4">
						<h2 className="text-2xl">welcome back, <strong>{session.user.name}</strong>! 👋</h2>
						<button 
							onClick={() => signOut()}
							className="px-6 py-2 bg-gray-800 rounded-full text-lg hover:bg-gray-700 transition duration-300"
						>
							🚪sign out
						</button>
						<button 
							onClick={handleDashboardRedirect}
							className="ml-4 px-6 py-2 bg-indigo-600 rounded-full text-lg hover:bg-indigo-500 transition duration-300"
						>
							🌍 go to your dashboard
						</button>
					</div>
				) : (
					<div className="space-y-4 flex flex-col items-center">
						<button
							onClick={() => signIn("github")}
							className="px-6 py-2 bg-gray-800 rounded-full text-lg hover:bg-gray-700 transition duration-300 flex items-center"
						>
							<img src="github_icon.png" alt="GitHub Logo" className="w-6 h-6 mr-2 invert" /> 
							<span>Sign in with GitHub</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}