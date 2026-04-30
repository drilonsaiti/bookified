'use client'

import {Show, SignInButton, SignUpButton, UserButton,useUser} from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

const navItems = [
    {label: "Library", href: "/"},
    {label: "Pricing", href: "/subscriptions"},
    {label: "Add new", href: "/books/new"}
]

const Navbar = () => {
    const pathName = usePathname();
    const { user } = useUser();
    return (
        <header className="w-full fixed z-50 bg-(--bg-primary)">
            <div className="wrapper navbar-height py-4 flex justify-between items-center">
                <Link href="/" className="flex -gap-0.5 items-center">
                    <Image src="/assets/logo.png" alt="Bookified" width={42} height={26}/>
                    <span className="logo-text">Bookified</span>
                </Link>


                <nav className="w-fit flex gap-7.5 items-center">
                    {navItems.map((item, index) => {
                        const isActive = pathName === item.href || item.href !== "/" && pathName.startsWith(item.href);
                        return (
                            <Link key={item.label} href={item.href}
                                  className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}>
                                {item.label}
                            </Link>
                        )
                    })}

                    <div className="flex gap-7.5 items-center">
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="nav-link-base text-black hover:opacity-70 cursor-pointer">Sign In</button>
                        </SignInButton>
                    </Show>
                    <Show when="signed-in">
                        <div className="nav-user-link">
                            <UserButton />
                            {user?.firstName && (
                                <Link href="/subscriptions" className={"nav-user-name"}>
                                    {user.firstName}
                                </Link>
                            )}
                        </div>
                    </Show>
                    </div>
                </nav>
            </div>

        </header>
    )
}
export default Navbar
