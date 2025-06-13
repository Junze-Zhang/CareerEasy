'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  country: string;
  state: string;
  className?: string;
  placeholder?: string;
}

// Major US cities by state (expanded list)
const usCitiesByState: Record<string, string[]> = {
  'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison'],
  'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai', 'Kodiak', 'Bethel', 'Palmer'],
  'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise', 'Yuma', 'Avondale', 'Goodyear', 'Flagstaff', 'Buckeye'],
  'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway', 'Rogers', 'Pine Bluff', 'Bentonville'],
  'CA': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard', 'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita', 'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario', 'Lancaster', 'Elk Grove', 'Corona', 'Palmdale', 'Salinas', 'Pomona', 'Hayward', 'Escondido', 'Torrance', 'Sunnyvale', 'Orange', 'Fullerton', 'Pasadena', 'Thousand Oaks', 'Visalia', 'Simi Valley', 'Concord', 'Roseville'],
  'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Centennial', 'Boulder', 'Greeley', 'Longmont', 'Loveland', 'Grand Junction', 'Broomfield'],
  'CT': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich'],
  'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford', 'Georgetown'],
  'DC': ['Washington'],
  'FL': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs', 'Miami Gardens', 'Clearwater', 'Palm Bay', 'Pompano Beach', 'West Palm Beach', 'Lakeland', 'Davie', 'Miami Beach', 'Sunrise', 'Plantation', 'Boca Raton', 'Deltona', 'Largo', 'Deerfield Beach', 'Boynton Beach'],
  'GA': ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Johns Creek', 'Albany', 'Warner Robins', 'Alpharetta', 'Marietta', 'Valdosta', 'Smyrna'],
  'HI': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu', 'Kaneohe', 'Kailua-Kona', 'Kahului', 'Mililani', 'Ewa Gentry'],
  'ID': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene', 'Twin Falls', 'Lewiston', 'Post Falls'],
  'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Cicero', 'Champaign', 'Bloomington', 'Arlington Heights', 'Evanston', 'Decatur', 'Schaumburg', 'Bolingbrook', 'Palatine', 'Skokie', 'Des Plaines'],
  'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Muncie', 'Lafayette', 'Terre Haute', 'Kokomo', 'Anderson', 'Noblesville'],
  'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Waterloo', 'Iowa City', 'Council Bluffs', 'Ames', 'West Des Moines', 'Dubuque'],
  'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina'],
  'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Georgetown', 'Florence', 'Hopkinsville', 'Nicholasville'],
  'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma'],
  'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford', 'Saco', 'Augusta', 'Westbrook'],
  'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown', 'Annapolis', 'College Park', 'Salisbury', 'Laurel'],
  'MA': ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford', 'Brockton', 'Quincy', 'Lynn', 'Fall River', 'Newton', 'Lawrence', 'Somerville', 'Framingham', 'Haverhill', 'Waltham', 'Malden', 'Brookline', 'Plymouth', 'Medford'],
  'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Livonia', 'Westland', 'Troy', 'Farmington Hills', 'Kalamazoo', 'Wyoming', 'Southfield'],
  'MN': ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'Saint Cloud', 'Eagan', 'Woodbury', 'Maple Grove', 'Eden Prairie', 'Coon Rapids', 'Burnsville', 'Blaine'],
  'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake'],
  'MO': ['Kansas City', 'Saint Louis', 'Springfield', 'Independence', 'Columbia', 'Lee\'s Summit', 'O\'Fallon', 'St. Joseph', 'St. Charles', 'St. Peters'],
  'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City'],
  'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'North Platte', 'Norfolk', 'Columbus'],
  'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City'],
  'NH': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester', 'Keene', 'Portsmouth', 'Laconia', 'Lebanon', 'Claremont'],
  'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Trenton', 'Camden', 'Clifton', 'Brick', 'Cherry Hill', 'Passaic'],
  'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad'],
  'NY': ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy', 'Niagara Falls', 'Binghamton'],
  'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Greenville', 'Asheville', 'Concord', 'Gastonia', 'Jacksonville', 'Chapel Hill'],
  'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton'],
  'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton', 'Springfield', 'Kettering', 'Elyria', 'Lakewood'],
  'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater'],
  'OR': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford', 'Springfield', 'Corvallis', 'Albany', 'Tigard', 'Lake Oswego', 'Keizer', 'Grants Pass'],
  'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Levittown', 'Harrisburg', 'Altoona', 'York', 'State College', 'Wilkes-Barre', 'Chester'],
  'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport', 'Central Falls', 'Westerly', 'North Providence'],
  'SC': ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Goose Creek', 'Hilton Head Island'],
  'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion'],
  'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Johnson City', 'Bartlett', 'Hendersonville'],
  'TX': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'McKinney', 'Frisco', 'Pasadena', 'Killeen', 'Carrollton', 'Midland', 'Waco', 'Denton', 'Abilene', 'Beaumont', 'Round Rock', 'Richardson', 'Odessa', 'Wichita Falls'],
  'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'Taylorsville'],
  'VT': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland', 'Bennington', 'Brattleboro', 'Milton', 'Hartford', 'Barre'],
  'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth', 'Suffolk', 'Roanoke', 'Lynchburg', 'Harrisonburg', 'Leesburg', 'Charlottesville', 'Danville'],
  'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima', 'Federal Way', 'Spokane Valley', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco'],
  'WV': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling', 'Martinsburg', 'Fairmont', 'Beckley', 'Clarksburg', 'Hurricane'],
  'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Eau Claire', 'Oshkosh', 'Janesville'],
  'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Jackson']
};

// Major Canadian cities by province (expanded list)
const canadaCitiesByProvince: Record<string, string[]> = {
  'AB': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove', 'Okotoks', 'Leduc', 'Lloydminster', 'Camrose', 'Brooks', 'Cold Lake'],
  'BC': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Coquitlam', 'Kelowna', 'Saanich', 'Delta', 'Langley', 'Kamloops', 'Victoria', 'Nanaimo', 'Chilliwack', 'Prince George', 'Vernon', 'Penticton', 'Campbell River', 'Courtenay', 'Cranbrook'],
  'MB': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler', 'Selkirk', 'Morden', 'Dauphin', 'The Pas'],
  'NB': ['Saint John', 'Moncton', 'Fredericton', 'Dieppe', 'Riverview', 'Edmundston', 'Miramichi', 'Bathurst', 'Campbellton', 'Caraquet'],
  'NL': ['St. John\'s', 'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Grand Falls-Windsor', 'Paradise', 'Gander', 'Happy Valley-Goose Bay', 'Torbay', 'Labrador City'],
  'NS': ['Halifax', 'Cape Breton', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow', 'Glace Bay', 'Yarmouth', 'Kentville', 'Amherst'],
  'ON': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville', 'Burlington', 'Oshawa', 'Barrie', 'St. Catharines', 'Cambridge', 'Kingston', 'Whitby', 'Guelph', 'Ajax', 'Thunder Bay', 'Chatham-Kent', 'Waterloo', 'Brantford', 'Pickering', 'Niagara Falls', 'Peterborough', 'Kawartha Lakes', 'Sarnia', 'Sault Ste. Marie', 'Milton', 'Newmarket', 'Welland', 'Belleville', 'Cornwall', 'North Bay'],
  'PE': ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague', 'Kensington', 'Souris', 'Alberton', 'Georgetown', 'Tignish'],
  'QC': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Lévis', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu', 'Repentigny', 'Boucherville', 'Saint-Jérôme', 'Châteauguay', 'Drummondville', 'Granby', 'Saint-Hyacinthe', 'Shawinigan', 'Dollard-des-Ormeaux'],
  'SK': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford', 'Estevan', 'Weyburn', 'Lloydminster'],
  'NT': ['Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith', 'Behchokǫ̀', 'Iqaluit', 'Norman Wells', 'Fort Simpson', 'Fort Resolution', 'Tulita'],
  'NU': ['Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake', 'Igloolik', 'Pangnirtung', 'Pond Inlet', 'Kugluktuk', 'Cape Dorset', 'Gjoa Haven'],
  'YT': ['Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction', 'Mayo', 'Faro', 'Carmacks', 'Teslin', 'Old Crow', 'Beaver Creek']
};

export default function CitySelect({ value, onChange, country, state, className = '', placeholder = 'Select city' }: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cities = useMemo(() => {
    if (!state) return [];
    const citiesMap = country === 'United States' ? usCitiesByState : country === 'Canada' ? canadaCitiesByProvince : {};
    const cityList = citiesMap[state] || [];
    // Remove duplicates and sort
    return [...new Set(cityList)].sort();
  }, [country, state]);

  useEffect(() => {
    const filtered = cities.filter(city =>
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm, cities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset when state changes
  useEffect(() => {
    if (value && cities.length > 0 && !cities.includes(value)) {
      onChange('');
      setSearchTerm('');
    }
  }, [state, cities, value, onChange]);

  const handleSelect = (city: string) => {
    onChange(city);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // Only update the actual value when user selects from dropdown, not when typing
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!value) {
      setSearchTerm('');
    }
  };

  const handleInputBlur = () => {
    // Delay to allow dropdown click to register
    setTimeout(() => {
      setSearchTerm('');
    }, 200);
  };

  const displayValue = value || '';

  if (!country || !state) {
    return (
      <input
        type="text"
        disabled
        placeholder={!country ? "Please select a country first" : "Please select a state/province first"}
        className={`${className} opacity-50 cursor-not-allowed`}
      />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={className}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelect(city)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 ${
                  value === city ? 'bg-brand-light-blue text-black' : ''
                }`}
              >
                {city}
              </button>
            ))
          ) : (
            <div className="px-4 py-2">
              <div className="text-gray-500 text-sm mb-2">
                No matches found. You can type a custom city name.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}