import { Divider, Menu, MenuItem } from "@mui/material";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { Link } from "react-router-dom";

function UserBox({ img }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            <button
                onClick={handleClick}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
            >
                {img ? (
                    <img className="size-10" src={img} alt="user" />
                ) : (
                    <CgProfile size={32} />
                )}
            </button>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <Link to="/profile">
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                </Link>
                <Link to="/billing-information">
                    <MenuItem onClick={handleClose}>
                        Billing Information
                    </MenuItem>
                </Link>
                <Link to="/payment-methods">
                    <MenuItem onClick={handleClose}>Payment Methods</MenuItem>
                </Link>
                <Link to="/affiliate">
                    <MenuItem onClick={handleClose}>Affiliate</MenuItem>
                </Link>
                <Link to="/change-password">
                    <MenuItem onClick={handleClose}>Change Password</MenuItem>
                </Link>
                <Divider />
                <Link to="/logout">
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                </Link>
            </Menu>
        </>
    );
}

export default UserBox;
