import { Details } from "express-useragent";

interface DeviceInfo {
    deviceType: string;
    browser: string;
}
  
export const getDeviceInfo = (userAgentInfo: Details | undefined): DeviceInfo => {
return userAgentInfo
    ? {
        deviceType: userAgentInfo.isDesktop 
        ? 'Desktop' 
        : userAgentInfo.isMobile 
        ? 'Mobile' 
        : userAgentInfo.isTablet 
        ? 'Tablet' 
        : 'Unknown',
        browser: userAgentInfo.browser || 'Unknown',
    }
    : { 
        deviceType: 'Unknown', 
        browser: 'Unknown' 
    };
}