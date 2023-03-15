import React, { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    // OR using local (public folder)
    // -------------------------------------------------------
    // const logo = (
    //   <Box
    //     component="img"
    //     src="/logo/logo_single.svg" => your path
    //     sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
    //   />
    // );

    const handleHome = () => {};

    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          width: 40,
          height: 40,
          display: 'inline-flex',
          ...sx,
        }}
        {...other}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.8373 0H0V3.81437H17.8373C27.7281 3.81437 35.7732 11.0744 35.7732 20C35.7732 28.9256 27.7281 36.1856 17.8373 36.1856H4.22684V20.0509H0V40H17.8373C30.0669 40 40 31.0235 40 20C40 8.97648 30.0669 0 17.8373 0Z"
            fill="url(#paint0_linear_146_87185)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_146_87185"
              x1="20"
              y1="0"
              x2="20"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#070189" />
              <stop offset="1" stopColor="#3AFBF6" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link
        // -------------------- A MODIFIER POUR LA PROD ---------------------
        href="http://localhost:3000/"
        // component={RouterLink}
        // to="/"
        sx={{ display: 'contents' }}
      >
        {logo}
      </Link>
    );
  }
);

export default Logo;
