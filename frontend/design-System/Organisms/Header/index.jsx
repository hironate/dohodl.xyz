import React from 'react';
import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChainData } from '../../../redux/action';
import { chainList } from '../../../config/chainList';
import Logo from '../../Molecules/Logo';
import { MenuBar } from '../../Molecules/MenuBar';
import { UserAccount } from '../../Organisms/UserAccount';
import { Menu } from '../../Atom/Menu';
import OutsideClickHandler from 'react-outside-click-handler';
import { getCurrentChainId } from '../../../utils/network/getCurrentChainId';
import { changeNetwork } from '../../../utils/network/changeNetwork';
import { toast } from 'react-toastify';
import { Dropdown } from '../../Atom/Dropdown';
import { Alert } from '../../Atom/Alert';
import { NetworksDropdown } from '../../Molecules/NetworkDropdown';
const LogoMemo = memo(Logo);
const DropdownMemo = memo(Dropdown);
const UserAccountMemo = memo(UserAccount);
const MenuMemo = memo(Menu);

const Header = () => {
  const chainData = useSelector((state) => state.ChainDataReducer);
  const dispatch = useDispatch();
  const [openChaiList, setOpenChaiList] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    fetchCurrentChainData();
    if (typeof window.ethereum !== 'undefined') {
      ethereum.on('chainChanged', function (chainId) {
        fetchCurrentChainData();
      });
    }
  }, []);

  const handleChainList = useCallback(() => {
    setOpenChaiList(!openChaiList);
  }, [openChaiList]);

  const handleOnClickDropdownItem = (data) => {
    if (typeof window.ethereum !== 'undefined') {
      changeNetwork(data);
    } else {
      changeNetworkLocally(data);
    }
    handleChainList();
  };

  const handleOnClickOutside = (e) => {
    let isOutsideClickable = true;
    for (let i = 0; i < 3; i++) {
      if (e.path[i] == dropdownRef.current) {
        isOutsideClickable = false;
        break;
      }
    }
    if (isOutsideClickable) {
      setOpenChaiList(false);
    }
  };

  const fetchCurrentChainData = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const chainId = await getCurrentChainId();
      if (chainId) {
        const currentChain = chainList.filter(function (val) {
          return val.chainId == chainId;
        });
        if (currentChain.length != 0) {
          dispatch(setChainData(currentChain[0]));
        } else {
          toast.error(
            'Connected to unsupported Network, Change your network in metamask',
          );
          await changeNetwork(chainList[0]);
        }
      }
    } else {
      dispatch(setChainData(chainList[0]));
    }
  };

  const changeNetworkLocally = (data) => {
    dispatch(setChainData(data));
  };

  return (
    <>
      <div className="bg-white sticky top-0 ">
        {typeof window.ethereum === 'undefined' && (
          <Alert>
            <div>
              MetaMask Extension Not Found !
              <a
                href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en"
                target="_blank"
                className=" font-bold ml-1"
                rel="noreferrer"
              >
                Click here to Install MetaMask
              </a>
            </div>
          </Alert>
        )}
        <div className="container mx-auto  py-5 flex justify-between items-center px-2">
          <div className="lg:ml-16 ">
            <LogoMemo url="/" className="h-8 md:h-12 cursor-pointer" />
          </div>
          <div className="flex space-x-2 md:space-x-5">
            <DropdownMemo
              imgSrc={chainData.logoUrl}
              name={chainData.name}
              dropdownRef={dropdownRef}
              dropdownOnClick={handleChainList}
            />
            <UserAccountMemo />
            <MenuMemo openMenu={openMenu} setOpenMenu={setOpenMenu} />
          </div>
        </div>
      </div>
      {openMenu && (
        <OutsideClickHandler onOutsideClick={() => setOpenMenu(false)}>
          <div
            className="md:hidden fixed z-20 bg-white w-full duration-500"
            onClick={() => setOpenMenu(false)}
          >
            <MenuBar />
          </div>
        </OutsideClickHandler>
      )}
      {openChaiList && (
        <OutsideClickHandler onOutsideClick={handleOnClickOutside}>
          <NetworksDropdown
            dropdownItems={chainList}
            onClickDropdownItem={handleOnClickDropdownItem}
          />
        </OutsideClickHandler>
      )}
    </>
  );
};

export default Header;
