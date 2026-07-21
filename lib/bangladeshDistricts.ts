export type District = {
  id: string;
  nameEn: string;
  nameBn: string;
  latitude: number;
  longitude: number;
};

// District HQ coordinates — accurate enough for prayer-time calc purposes
// (times don't meaningfully vary within a district).
export const BANGLADESH_DISTRICTS: District[] = [
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা', latitude: 23.8103, longitude: 90.4125 },
  { id: 'faridpur', nameEn: 'Faridpur', nameBn: 'ফরিদপুর', latitude: 23.607, longitude: 89.8429 },
  { id: 'gazipur', nameEn: 'Gazipur', nameBn: 'গাজীপুর', latitude: 23.9999, longitude: 90.4203 },
  { id: 'gopalganj', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', latitude: 23.005, longitude: 89.8266 },
  { id: 'kishoreganj', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', latitude: 24.4449, longitude: 90.7766 },
  { id: 'madaripur', nameEn: 'Madaripur', nameBn: 'মাদারীপুর', latitude: 23.1641, longitude: 90.1897 },
  { id: 'manikganj', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', latitude: 23.8644, longitude: 90.0047 },
  { id: 'munshiganj', nameEn: 'Munshiganj', nameBn: 'মুন্সিগঞ্জ', latitude: 23.5422, longitude: 90.5305 },
  { id: 'narayanganj', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', latitude: 23.6238, longitude: 90.5 },
  { id: 'narsingdi', nameEn: 'Narsingdi', nameBn: 'নরসিংদী', latitude: 23.9322, longitude: 90.715 },
  { id: 'rajbari', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', latitude: 23.7574, longitude: 89.6444 },
  { id: 'shariatpur', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', latitude: 23.2423, longitude: 90.4348 },
  { id: 'tangail', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', latitude: 24.2513, longitude: 89.9167 },

  { id: 'bandarban', nameEn: "Bandarban", nameBn: 'বান্দরবান', latitude: 22.1953, longitude: 92.2184 },
  { id: 'brahmanbaria', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', latitude: 23.957, longitude: 91.1119 },
  { id: 'chandpur', nameEn: 'Chandpur', nameBn: 'চাঁদপুর', latitude: 23.2333, longitude: 90.6712 },
  { id: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', latitude: 22.3569, longitude: 91.7832 },
  { id: 'comilla', nameEn: 'Comilla', nameBn: 'কুমিল্লা', latitude: 23.4607, longitude: 91.1809 },
  { id: 'coxsbazar', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', latitude: 21.4272, longitude: 92.0058 },
  { id: 'feni', nameEn: 'Feni', nameBn: 'ফেনী', latitude: 23.0159, longitude: 91.3976 },
  { id: 'khagrachhari', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', latitude: 23.1193, longitude: 91.9847 },
  { id: 'lakshmipur', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', latitude: 22.944, longitude: 90.8282 },
  { id: 'noakhali', nameEn: 'Noakhali', nameBn: 'নোয়াখালী', latitude: 22.8696, longitude: 91.0995 },
  { id: 'rangamati', nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', latitude: 22.6533, longitude: 92.1787 },

  { id: 'bogura', nameEn: 'Bogura', nameBn: 'বগুড়া', latitude: 24.8465, longitude: 89.3773 },
  { id: 'joypurhat', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', latitude: 25.0968, longitude: 89.0227 },
  { id: 'naogaon', nameEn: 'Naogaon', nameBn: 'নওগাঁ', latitude: 24.7936, longitude: 88.9318 },
  { id: 'natore', nameEn: 'Natore', nameBn: 'নাটোর', latitude: 24.4206, longitude: 88.9873 },
  { id: 'chapainawabganj', nameEn: 'Chapai Nawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', latitude: 24.5965, longitude: 88.2775 },
  { id: 'pabna', nameEn: 'Pabna', nameBn: 'পাবনা', latitude: 24.0064, longitude: 89.2372 },
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী', latitude: 24.3745, longitude: 88.6042 },
  { id: 'sirajganj', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', latitude: 24.4534, longitude: 89.7006 },

  { id: 'bagerhat', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', latitude: 22.6602, longitude: 89.7895 },
  { id: 'chuadanga', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', latitude: 23.6402, longitude: 88.841 },
  { id: 'jashore', nameEn: 'Jashore', nameBn: 'যশোর', latitude: 23.1667, longitude: 89.2167 },
  { id: 'jhenaidah', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', latitude: 23.5448, longitude: 89.1539 },
  { id: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা', latitude: 22.8456, longitude: 89.5403 },
  { id: 'kushtia', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', latitude: 23.9013, longitude: 89.1206 },
  { id: 'magura', nameEn: 'Magura', nameBn: 'মাগুরা', latitude: 23.4855, longitude: 89.4198 },
  { id: 'meherpur', nameEn: 'Meherpur', nameBn: 'মেহেরপুর', latitude: 23.7622, longitude: 88.6318 },
  { id: 'narail', nameEn: 'Narail', nameBn: 'নড়াইল', latitude: 23.1725, longitude: 89.5126 },
  { id: 'satkhira', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', latitude: 22.7185, longitude: 89.0705 },

  { id: 'barguna', nameEn: 'Barguna', nameBn: 'বরগুনা', latitude: 22.0953, longitude: 90.1121 },
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল', latitude: 22.701, longitude: 90.3535 },
  { id: 'bhola', nameEn: 'Bhola', nameBn: 'ভোলা', latitude: 22.6859, longitude: 90.6482 },
  { id: 'jhalokati', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', latitude: 22.6406, longitude: 90.1987 },
  { id: 'patuakhali', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', latitude: 22.3596, longitude: 90.3298 },
  { id: 'pirojpur', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', latitude: 22.5841, longitude: 89.972 },

  { id: 'habiganj', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', latitude: 24.3745, longitude: 91.4155 },
  { id: 'moulvibazar', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', latitude: 24.4829, longitude: 91.7774 },
  { id: 'sunamganj', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', latitude: 25.0658, longitude: 91.395 },
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট', latitude: 24.8949, longitude: 91.8687 },

  { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', latitude: 25.6279, longitude: 88.6332 },
  { id: 'gaibandha', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', latitude: 25.3288, longitude: 89.5285 },
  { id: 'kurigram', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', latitude: 25.8054, longitude: 89.6362 },
  { id: 'lalmonirhat', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', latitude: 25.9923, longitude: 89.2847 },
  { id: 'nilphamari', nameEn: 'Nilphamari', nameBn: 'নীলফামারী', latitude: 25.9317, longitude: 88.856 },
  { id: 'panchagarh', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', latitude: 26.3411, longitude: 88.5542 },
  { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর', latitude: 25.7439, longitude: 89.2752 },
  { id: 'thakurgaon', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', latitude: 26.0336, longitude: 88.4616 },

  { id: 'jamalpur', nameEn: 'Jamalpur', nameBn: 'জামালপুর', latitude: 24.9375, longitude: 89.937 },
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', latitude: 24.7471, longitude: 90.4203 },
  { id: 'netrokona', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', latitude: 24.8707, longitude: 90.728 },
  { id: 'sherpur', nameEn: 'Sherpur', nameBn: 'শেরপুর', latitude: 25.0204, longitude: 90.0153 },
];

// Straight-line distance is plenty accurate at district scale — avoids a
// reverse-geocoding network call just to label the header with a name the
// app already has (bilingual) for every district.
export function nearestDistrict(latitude: number, longitude: number): District {
  let closest = BANGLADESH_DISTRICTS[0];
  let closestDist = Infinity;
  for (const district of BANGLADESH_DISTRICTS) {
    const dLat = district.latitude - latitude;
    const dLon = district.longitude - longitude;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < closestDist) {
      closestDist = dist;
      closest = district;
    }
  }
  return closest;
}
