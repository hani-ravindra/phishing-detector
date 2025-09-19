// Shared feature extraction function
function extractFeatures(url) {
    const features = {};

    try {
        const parser = new URL(url);

        //1. Having IP Address
        features.having_IP_Address = /\d+\.\d+\.\d+\.\d+/.test(url) ? 1 : -1;

        //2. URL Length
        features.URL_Length = url.length < 54 ? -1 : (url.length <= 75 ? 0 : 1);
        
        //3. Shortening Service
        features.Shortining_Service = /(bit\.ly|goo\.gl|tinyurl\.com|ow\.ly|t\.co)/.test(url) ? 1 : -1;
        
        //4. Having @ Symbol
        features.having_At_Symbol = url.includes('@') ? 1 : -1;
        
        //5. Redirection
        features.double_slash_redirecting = url.slice(7).includes("//") ? 1 : -1;
        
        //6. Prefix or Suffix
        features.Prefix_Suffix = parser.hostname.includes('-') ? 1 : -1;
        
        //7. Sub-Domain 
        const dots = parser.hostname.split('.').length;
        features.having_Sub_Domain = dots <= 3 ? -1 : dots === 4 ? 0 : 1;

        //8. SSL Final State
        features.SSLfinal_State = parser.protocol === "https:" ? -1 : 1;
        
        //9. Domain Registration Length
        features.Domain_registeration_length = parser.hostname.endsWith(".icu") || parser.hostname.endsWith(".xyz") ? 1 : -1;
        
        //10. Favicon
        features.Favicon = -1;

        //11. Port
        features.port = (parser.port && parser.port !== "80" && parser.port !== "443") ? 1 : -1;
        
        //12. HTTPS Token
        features.HTTPS_token = parser.hostname.includes("https") ? 1 : -1;
        
        //13. Request URL
        features.Request_URL = -1;
        
        //14. URL of Anchor
        features.URL_of_Anchor = -1;
        
        //15. Links in tags
        features.Links_in_tags = -1;
        
        //16. SFH
        features.SFH = -1;
        
        //17. Submitting to Email
        features.Submitting_to_email = url.includes("mailto:") ? 1 : -1;
        
        //18. Abnormal URL
        features.Abnormal_URL = /(login|verify|update|secure|account)/i.test(url) ? 1 : -1;
        
        //19. Redirect
        features.Redirect = /(redirect|rurl|url=|dest=|out=|view=)/i.test(url) ? 1 : -1;
        
        //20. on_mouseover
        features.on_mouseover = -1;

        //21. RightClick
        features.RightClick = -1;
        
        //22. popUpWidnow
        features.popUpWidnow = -1;
        
        //23. Iframe
        features.Iframe = -1;
        
        //24. age_of_domain
        features.age_of_domain = parser.hostname.endsWith(".icu") ? 1 : -1;
        
        //25. DNS Record
        features.DNSRecord = parser.hostname.endsWith(".icu") ? 1 : -1;
        
        //26. Website Redirection
        features.web_traffic = parser.hostname.endsWith(".google.com") ? -1 : 1;
        
        //27. Page Rank
        features.Page_Rank = -1;
        
        //28. Google Index
        features.Google_Index = -1;
        
        //29. Links Pointing to Page
        features.Links_pointing_to_page = -1;
        
        //30. Statistical Report
        features.Statistical_report = /(paypal|allegro|bank|secure|account)/i.test(parser.hostname) ? 1 : -1;


    } catch (err) {
        console.error("Error extracting features: ", err);
        return new Array(30).fill(1);
    }

    return features;
}
