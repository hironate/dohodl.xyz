import Link from 'next/link';
import Logo from '../../Molecules/Logo';
import { Button } from '../../Atom/Button';
import { useRouter } from 'next/router';
const Footer = () => {
  const menus = [{ text: 'About', link: '/about' }];
  const router = useRouter();
  return (
    <footer className="p-4 bg-white rounded-lg shadow md:px-6 md:py-8  mt-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <a href="/" target="_blank" className="flex items-center mb-4 sm:mb-0">
          <Logo logoLight={false} url="/" className={'h-10 mx-3'} />
          <span className="self-center ml-2 text-xl font-semibold ">Hodl</span>
        </a>
        <ul className="flex flex-wrap items-center mb-6 sm:mb-0">
          {menus.map((item, index) => {
            const active = router.pathname == item.link;
            return (
              <li key={index}>
                <Button
                  link={item.link}
                  customClassName={`mr-4 text-sm ${
                    active ? 'text-blue-600' : 'text-gray-500 '
                  } hover:underline md:mr-6 `}
                >
                  {item.text}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
      <hr className="my-6 border-gray-200 sm:mx-auto  lg:my-4" />
      <span className="block text-sm text-gray-500 sm:text-center ">
        © 2022
        <Link
          href="https://dohodl.xyz"
          target="_blank"
          className="hover:underline"
        >
          &nbsp;Hodl
        </Link>
        . All Rights Reserved.
      </span>
    </footer>
  );
};

export default Footer;
