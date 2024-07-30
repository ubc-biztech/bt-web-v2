export function isMobile(userAgent: string | undefined) {
    const mobileKeywords = [
        'mobile',
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone'
    ];

    const agent = userAgent?.toLowerCase();

    return mobileKeywords.some(keyword => agent?.includes(keyword));
}
