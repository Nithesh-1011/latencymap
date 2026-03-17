export interface RegionMeta {
    id: string;
    location: string;
    flag: string;
}

export const REGIONS: RegionMeta[] = [
    { id: "us-east-1", location: "N. Virginia", flag: "🇺🇸" },
    { id: "us-east-2", location: "Ohio", flag: "🇺🇸" },
    { id: "us-west-1", location: "N. California", flag: "🇺🇸" },
    { id: "us-west-2", location: "Oregon", flag: "🇺🇸" },
    { id: "ca-central-1", location: "Canada Central", flag: "🇨🇦" },
    { id: "sa-east-1", location: "São Paulo", flag: "🇧🇷" },
    { id: "eu-west-1", location: "Ireland", flag: "🇮🇪" },
    { id: "eu-west-2", location: "London", flag: "🇬🇧" },
    { id: "eu-west-3", location: "Paris", flag: "🇫🇷" },
    { id: "eu-central-1", location: "Frankfurt", flag: "🇩🇪" },
    { id: "eu-north-1", location: "Stockholm", flag: "🇸🇪" },
    { id: "eu-south-1", location: "Milan", flag: "🇮🇹" },
    { id: "me-south-1", location: "Bahrain", flag: "🇧🇭" },
    { id: "af-south-1", location: "Cape Town", flag: "🇿🇦" },
    { id: "ap-south-1", location: "Mumbai", flag: "🇮🇳" },
    { id: "ap-southeast-1", location: "Singapore", flag: "🇸🇬" },
    { id: "ap-southeast-2", location: "Sydney", flag: "🇦🇺" },
    { id: "ap-northeast-1", location: "Tokyo", flag: "🇯🇵" },
    { id: "ap-northeast-2", location: "Seoul", flag: "🇰🇷" },
    { id: "ap-northeast-3", location: "Osaka", flag: "🇯🇵" },
    { id: "ap-east-1", location: "Hong Kong", flag: "🇭🇰" },
    { id: "ap-southeast-3", location: "Jakarta", flag: "🇮🇩" },
];