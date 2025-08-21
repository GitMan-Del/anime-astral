import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function UserProfile() {
    const { data: session, status } = useSession();
    const defaultImage = "/default-avatar.png";

    return (
        <div className="absolute top-10 right-14 z-50 drop-shadow-lg">
            <div className="w-fit min-w-[260px] h-[250px] bg-[#181818] border border-[#595959]/30 rounded-xl text-white p-4 flex flex-col justify-between shadow-lg">
                {status === "loading" ? (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-white"></div>
                    </div>
                ) : !session?.user ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2">
                        <Image
                            src={defaultImage}
                            width={48}
                            height={48}
                            alt="Default User"
                            className="rounded-full opacity-60"
                        />
                        <span className="text-sm text-gray-400">Nu ești autentificat</span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4">
                            <Image
                                src={session.user.image || defaultImage}
                                width={48}
                                height={48}
                                alt={session.user.name || "User Profile"}
                                priority
                                className="rounded-full border border-[#595959]/40"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-base font-semibold truncate max-w-[120px]">{session.user.name || "Nume necunoscut"}</h1>
                                <p className="text-xs text-gray-400 truncate max-w-[120px]">{session.user.email || "Email necunoscut"}</p>
                            </div>
                        </div>
                        <hr className="my-4 border-[#595959]/30" />
                        <button
                            className="text-[#BC281C] text-sm flex flex-row gap-2 items-center justify-center hover:cursor-pointer hover:scale-105 transition-transform duration-150 font-medium"
                            onClick={() => signOut()}
                            aria-label="Sign out"
                        >
                            <LogOut color="#BC281C" size={20} />
                            Deconectează-te
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}