"use client";

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

import AngleDown from "@public/icons/angle-down.svg"
import { FaAngleDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation'


type NormalLink = {
    link: string,
    text: string,
    type: "Link"
}
type DropdownLink = {
    text: string,
    type: "Dropdown",
    links: {
        link: string,
        text: string,
    }[]
}

type link = NormalLink | DropdownLink

const NavLinks: link[] = [
    {
        link: "/",
        text: "Home",
        type: "Link"
    },
    {
        link: "/about",
        text: "About",
        type: "Link"
    },
    {
        link: "/services",
        text: "Services",
        type: "Link"
    },
    {
        link: "/contact",
        text: "Contact",
        type: "Link"
    },
    {
        text: "More",
        type: "Dropdown",
        links: [
            {
                link: "/design",
                text: "Designs"
            },
            {
                link: "/blog",
                text: "Blog"
            },
        ]
    }
]

type NavLinkProps = {
    to: string,
    children: ReactNode
}

const NavLink = ({to, children}: NavLinkProps ) => {

    const pathname = usePathname(); 

    return <Link href={to} className={`text-lg hover:scale-110 transition-all duration-300  ${pathname == to ? "text-primary font-medium" : "text-black hover:text-primary"}`}>
        {children}
    </Link>
}

const NavDropDown: React.FC<React.PropsWithChildren<{link: DropdownLink}>> = ({link, children}) => {
    const [open, setOpen] = useState(false)
    const pathname = usePathname();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);


    return <div className="mx-4 relative z-50">
        <a className="text-lg flex space-x-1 hover:cursor-pointer" onClick={() => setOpen(!open)}>
            <span>{link.text}</span>
            <FaAngleDown size={17.5} className={`${open ? "rotate-180" : "rotate-0"} transition duration-300 ease-in-out`}/>
        </a>
        <ul className={`absolute bottom flex flex-col rounded-lg text-lg bg-gray-200 bg-opacity-100 overflow-hidden w-fit ${open ? "h-[100px]" : "h-[0px]"} transition-all duration-300 ease-in-out`}>
            {link.links.map((childLink, index) => (
                <li key={index} className={`w-full mt-4 mx-4 hover:scale-110 hover:text-purple transition duration-150 ease-in-out ${pathname == childLink.link   ? "text-primary font-medium" : "text-black hover:text-primary"}`}>
                    <Link href={childLink.link} className="w-full block">
                        {childLink.text}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
}

const MobileNav: React.FC<{open: boolean, setOpen: Dispatch<SetStateAction<boolean>>}> = ({open, setOpen}) => {

    const pathname = usePathname();

    return (
        <div className={`visible md:invisible z-[998] fixed top-0 left-0 h-screen w-screen bg-white transform ${open ? "-translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out filter drop-shadow-md `}>
            <div className="flex items-center justify-center filter drop-shadow-md bg-white h-20"> {/*logo container*/}
                <Link className="text-2xl font-bold font-sans hover:scale-125 transition duration-300" href="/">
                    <Image src="/Logo.svg" height={476} width={151} alt="LOGO" />
                </Link>

            </div>
            <ul className="flex flex-col mt-4 ml-4 space-y-4 text-2xl font-medium">
                {NavLinks.map((val, index) => (
                    <>
                        {val.type=="Link" && 
                            <li key={index}>
                                <Link key={index} href={val.link} className={`my-4 transition-all duration-300  ${pathname == val.link ? "text-violet-600 font-medium" : "text-black hover:text-violet-600"}`}
                                    onClick={() => setTimeout(() => {
                                        setOpen(!open)
                                        document.body.style.overflow = "scroll"
                                    }, 100)}
                                >
                                    {val.text}
                                </Link>
                                
                            </li>
                        }
                        {val.type=="Dropdown" && val.links.map((dropDownLink, dropDownIndex) => (
                            <li key={index+dropDownIndex}>
                                <Link key={index} href={dropDownLink.link} className={`my-4 transition-all duration-300  ${pathname == dropDownLink.link ? "text-violet-600 font-medium" : "text-black hover:text-violet-600"}`}
                                    onClick={() => setTimeout(() => {
                                        setOpen(!open)
                                        document.body.style.overflow = "scroll"
                                    }, 100)}
                                >
                                    {dropDownLink.text}
                                </Link>
                            </li>
                        ))}
                    
                    </>
                    
                ))}
            </ul>  
        </div>
    )
}

const Header: React.FC = () => {
    
    const [open, setOpen] = useState(false)
    return (
        <nav className="transition-all duration-100 container mx-auto px-2 md:px-0 font-sans flex py-4 h-20 items-center">
            <MobileNav open={open} setOpen={setOpen}/>
            <div className="w-4/12 xs:w-3/12 flex items-center">
                <Link className="text-2xl font-bold font-sans hover:scale-125 transition duration-300" href="/">
                    <Image src="/Logo.svg" height={476} width={151} alt="LOGO" />
                </Link>
            </div>
            <div className="w-8/12 xs:w-9/12 flex justify-end items-center">
                
                <div className="hidden md:flex space-x-6 items-center">
                    {NavLinks.map((val, index) => (
                        <>
                            {val.type=="Link" &&
                                <NavLink to={val.link} key={index}>
                                    {val.text}
                                </NavLink>
                            }
                            {val.type=="Dropdown" &&
                                <NavDropDown link={val} key={index} />
                            }
                        </>
                    ))}
                    <Link href="/contact?ref=get_a_quote" className="mr-6 lg:mr-0 text-white bg-primary text-md lg:text-lg px-[20px] py-[7px] rounded-lg hover:scale-110 transition duration-300 ease-in-out whitespace-nowrap">
                        Get a Quote
                    </Link>
                </div>

                <div className={`${open ? "w-[32px] h-[32px]" : ""}`}></div>
                <button aria-label="Hamburger Icon" className={`z-[999] ${open ? "fixed" : "relative"} flex w-8 h-8 flex-col justify-between items-center md:hidden`} onClick={() => {
                    if (open) {
                        setOpen(false)
                        document.body.style.overflow = "scroll"

                    } else {
                        setOpen(true)
                        document.body.style.overflow = "hidden"
                    }
                }}>
                    {/* hamburger button */}
                    <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "rotate-45 translate-y-3.5" : ""}`} />
                    <span className={`h-1 w-full bg-black rounded-lg transition-all duration-300 ease-in-out ${open ? "w-0" : "w-full"}`} />
                    <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-3.5" : ""}`} />
                </button>


            </div>
        </nav>
    )
}

export default Header;