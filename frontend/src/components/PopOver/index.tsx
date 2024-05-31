import { Menu, MenuItem } from "@mui/material";
import React from "react";

export const PopOver = ({
  items = [],
  onItemClick = () => {},
  children,
  selectedItem = "All",
}: {
  items: any[];
  onItemClick?: (item: any) => void;
  children: React.ReactNode;
  selectedItem?: string;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item: any) => {
    onItemClick(item);
    handleClose();
  };

  return (
    <div className="">
      <button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className="flex items-center"
      >
        {children}
      </button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        className="z-999"
      >
        {items.map((item, index: number) => (
          <MenuItem
            key={index}
            onClick={() => handleItemClick(item)}
            selected={item === selectedItem}
          >
            {item}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default PopOver;
