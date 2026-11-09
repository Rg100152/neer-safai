/* ==========================================================================
   Neer Safai — Static demo data
   Used by pages for officials, notices, FAQ, schemes, tips, vacancies,
   gallery and complaint form options.
   ========================================================================== */

const NS_DATA = {
  states: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh"
  ],

  issueTypes: [
    "Contaminated / Dirty Water",
    "No Water Supply",
    "Low Water Pressure",
    "Pipeline Leakage",
    "Sewage Mixing in Water",
    "High TDS / Hard Water",
    "Broken Public Tap / Handpump",
    "Other"
  ],

  officials: [
    { name: "Dr. Anjali Verma", designation: "Chief Water Quality Officer", dept: "Ministry of Jal Shakti", state: "Delhi", email: "anjali.verma@gov.in", phone: "+91 11 2371 0200" },
    { name: "Shri Rakesh Iyer", designation: "Regional Sanitation Director", dept: "Jal Jeevan Mission", state: "Maharashtra", email: "rakesh.iyer@gov.in", phone: "+91 22 2202 5151" },
    { name: "Smt. Meera Nair", designation: "State Nodal Officer", dept: "Swachh Bharat Mission", state: "Kerala", email: "meera.nair@gov.in", phone: "+91 471 230 1999" },
    { name: "Shri Vikram Singh", designation: "Executive Engineer (Water)", dept: "Public Health Engineering", state: "Uttar Pradesh", email: "vikram.singh@gov.in", phone: "+91 522 262 0123" },
    { name: "Dr. Priya Deshmukh", designation: "Public Health Specialist", dept: "National Health Mission", state: "Madhya Pradesh", email: "priya.deshmukh@gov.in", phone: "+91 755 255 4455" },
    { name: "Shri Arjun Rao", designation: "District Water Officer", dept: "Rural Water Supply", state: "Telangana", email: "arjun.rao@gov.in", phone: "+91 40 2345 6789" },
    { name: "Smt. Kavita Joshi", designation: "Laboratory Head", dept: "Water Testing Lab", state: "Gujarat", email: "kavita.joshi@gov.in", phone: "+91 79 2657 8899" },
    { name: "Shri Sanjay Patel", designation: "Commissioner", dept: "Municipal Water Board", state: "Rajasthan", email: "sanjay.patel@gov.in", phone: "+91 141 222 3344" }
  ],

  notices: [
    { id: "NS/NOTICE/2026/014", title: "Annual Water Quality Audit Drive — All Districts", date: "2026-11-02", category: "Circular", priority: "High", body: "All district water officers are directed to complete the annual water quality audit and upload TDS/pH reports to the portal before 30 November 2026." },
    { id: "NS/NOTICE/2026/013", title: "Jal Jeevan Mission — Q3 Progress Review Meeting", date: "2026-10-24", category: "Meeting", priority: "Medium", body: "A Q3 progress review meeting for all state nodal officers will be held online on 12 November 2026 at 11:00 AM. Attendance is mandatory." },
    { id: "NS/NOTICE/2026/012", title: "Guidelines for Emergency Water Tanker Deployment", date: "2026-10-11", category: "Guideline", priority: "High", body: "Revised SOP for deployment of emergency water tankers during supply disruptions. Please circulate to all field teams." },
    { id: "NS/NOTICE/2026/011", title: "Swachh Bharat Mission — Village Sanitation Survey", date: "2026-09-28", category: "Order", priority: "Medium", body: "Village-level sanitation surveys must be completed using the standard mobile form. Data to be submitted by 20 October 2026." },
    { id: "NS/NOTICE/2026/010", title: "Lab Equipment Procurement — Tender Notice", date: "2026-09-15", category: "Tender", priority: "Low", body: "Tenders are invited for supply of portable TDS and pH testing kits for district laboratories. Last date: 15 October 2026." }
  ],

  faqs: [
    { q: "How do I file a water complaint on Neer Safai?", a: "Open the Report Issue page, fill in your name, 10-digit mobile number, state, district, issue type and a short description, then submit. You will instantly receive a unique Complaint ID such as NS-2026-1024. Save this ID to track progress." },
    { q: "How can I track my complaint status?", a: "Go to the Track Complaint page, enter your Complaint ID and click Track. You will see a live timeline showing Filed, Under Review, and Resolved stages along with the latest officer remarks." },
    { q: "Is the water quality checker based on real sensor data?", a: "For this demonstration portal, the quality report (TDS, pH, hardness) is generated from a deterministic sample model based on your pincode. In a production deployment it would connect to certified laboratory and IoT sensor feeds." },
    { q: "What TDS and pH values are considered safe?", a: "As per BIS 10500 guidelines, drinking water TDS should ideally be below 500 ppm and pH should remain between 6.5 and 8.5. Values outside this range are flagged as unsafe and forwarded for inspection." },
    { q: "Who can access the admin dashboard?", a: "Only authorised government officials with valid credentials can access the dashboard, analytics, and officials directory. Unauthenticated visitors are automatically redirected to the official login page." },
    { q: "Is my personal information safe?", a: "Yes. Only your name, contact number, and complaint details are used to process the grievance. Data is stored securely and is never shared with third parties. See our Privacy Policy for details." },
    { q: "Can I upload a photo with my complaint?", a: "Yes, the report form supports a photo attachment for visual evidence. The demo stores a preview locally; the Flask backend can be extended to accept multipart uploads with object storage." },
    { q: "What is the helpline number for urgent water emergencies?", a: "Call the national water helpline 1800-11-9999 (toll free, 24x7). For life-threatening contamination events, also contact your district emergency operations centre immediately." }
  ],

  schemes: [
    { name: "Jal Jeevan Mission", tag: "Har Ghar Jal", desc: "Aims to provide functional household tap connections to every rural household by 2030, with a strong focus on water quality monitoring and community ownership.", icon: "fa-faucet-drip", link: "report.html", stat: "14.8 Cr+ tap connections" },
    { name: "Swachh Bharat Mission", tag: "Clean India", desc: "Accelerates universal sanitation coverage, safe disposal of waste, and behaviour change communication for healthier villages and cities.", icon: "fa-broom", link: "water-tips.html", stat: "10 Cr+ toilets built" },
    { name: "Namami Gange", tag: "River Rejuvenation", desc: "Integrated conservation mission for the Ganga basin covering sewage treatment, riverfront development, biodiversity, and public participation.", icon: "fa-water", link: "quality.html", stat: "4,000+ MLD treatment" },
    { name: "Atal Bhujal Yojana", tag: "Groundwater", desc: "Community-led sustainable groundwater management in water-stressed blocks with participative irrigation and demand-side interventions.", icon: "fa-droplet", link: "quality.html", stat: "229 districts covered" },
    { name: "AMRUT 2.0", tag: "Urban Water", desc: "Provides water supply, sewerage, septage management, and rejuvenation of water bodies in statutory towns to make cities water secure.", icon: "fa-city", link: "about.html", stat: "4,800+ projects" },
    { name: "National Water Mission", tag: "Conservation", desc: "Promotes conservation, minimisation of wastage and equitable distribution of water through regulatory and participatory mechanisms.", icon: "fa-seedling", link: "water-tips.html", stat: "20% efficiency target" }
  ],

  waterTips: [
    { title: "Fix Every Leak", icon: "fa-wrench", desc: "A dripping tap can waste more than 20 litres of water a day. Repair leaks promptly and report public pipeline leaks on this portal.", tag: "Save 7,000L/year" },
    { title: "Take Shorter Showers", icon: "fa-shower", desc: "Cutting your shower by just two minutes saves around 40 litres of water per person every day.", tag: "Save 40L/day" },
    { title: "Reuse Cooking Water", icon: "fa-utensils", desc: "Water used to rinse vegetables or boil pasta can be cooled and reused for watering plants.", tag: "Reuse" },
    { title: "Run Full Loads Only", icon: "fa-shirt", desc: "Washing machines and dishwashers should only be run with full loads to maximise water efficiency.", tag: "Save 20%" },
    { title: "Harvest Rainwater", icon: "fa-cloud-rain", desc: "Install rooftop rainwater harvesting to recharge groundwater and reduce dependence on tankers.", tag: "Recharge" },
    { title: "Turn Off While Brushing", icon: "fa-tooth", desc: "Do not let the tap run while brushing or shaving. A simple habit that saves 6 litres every minute.", tag: "Save 6L/min" }
  ],

  vacancies: [
    { role: "Water Quality Analyst", dept: "Ministry of Jal Shakti", location: "New Delhi", type: "Full Time", deadline: "2026-12-15", salary: "₹7.2 – 10.4 LPA", tags: ["TDS", "Lab", "BIS 10500"] },
    { role: "Field Sanitation Officer", dept: "Local Municipal Body", location: "Mumbai", type: "Contract", deadline: "2026-12-20", salary: "₹4.8 – 6.6 LPA", tags: ["Field", "Survey", "SBM"] },
    { role: "Data Scientist (Water Analytics)", dept: "National Informatics Centre", location: "Bengaluru", type: "Full Time", deadline: "2026-12-05", salary: "₹12 – 18 LPA", tags: ["Python", "ML", "Dashboard"] },
    { role: "Sanitation Engineer", dept: "Public Health Engineering", location: "Lucknow", type: "Full Time", deadline: "2026-12-28", salary: "₹6 – 8.5 LPA", tags: ["Sewerage", "STP", "Design"] },
    { role: "Community Mobilisation Officer", dept: "Jal Jeevan Mission", location: "Patna", type: "Contract", deadline: "2026-12-10", salary: "₹3.6 – 5 LPA", tags: ["Rural", "Training", "VWSC"] },
    { role: "IoT Systems Engineer", dept: "Smart Water Mission", location: "Hyderabad", type: "Full Time", deadline: "2026-12-31", salary: "₹9 – 14 LPA", tags: ["Sensors", "LoRa", "Telemetry"] }
  ],

  gallery: [
    { src: "images/water-1.png", title: "Himalayan Glacial Streams", tag: "Source Water" },
    { src: "images/water-4.png", title: "Restored River Basin", tag: "Namami Gange" },
    { src: "images/water-6.png", title: "Village Handpump Revival", tag: "Jal Jeevan" },
    { src: "images/water-8.png", title: "Community Rainwater Harvest", tag: "Conservation" },
    { src: "images/water-14.png", title: "Clean Reservoir Network", tag: "Infrastructure" },
    { src: "images/water-10.png", title: "Forested Catchment Area", tag: "Ecology" }
  ],

  coverage: [
    { state: "Uttar Pradesh", complaints: 4820, resolved: 4210, x: 43, y: 34 },
    { state: "Maharashtra", complaints: 3640, resolved: 3320, x: 32, y: 56 },
    { state: "Bihar", complaints: 2910, resolved: 2440, x: 54, y: 33 },
    { state: "Madhya Pradesh", complaints: 2380, resolved: 2100, x: 38, y: 45 },
    { state: "Rajasthan", complaints: 2140, resolved: 1890, x: 26, y: 38 },
    { state: "West Bengal", complaints: 1980, resolved: 1710, x: 58, y: 40 },
    { state: "Tamil Nadu", complaints: 1740, resolved: 1590, x: 44, y: 76 },
    { state: "Karnataka", complaints: 1520, resolved: 1380, x: 36, y: 66 },
    { state: "Gujarat", complaints: 1380, resolved: 1250, x: 22, y: 49 },
    { state: "Kerala", complaints: 890, resolved: 860, x: 39, y: 82 }
  ]
};

/* Deterministic pseudo-random quality model for the demo checker */
function nsQualityForPincode(pincode) {
  const pin = String(pincode || "").replace(/\D/g, "");
  let h = 0;
  for (let i = 0; i < pin.length; i++) h = (h * 31 + pin.charCodeAt(i)) % 100000;
  const tds = 70 + (h % 380);
  const ph = Number((6.4 + ((h >> 3) % 24) / 10).toFixed(1));
  const hardness = 80 + (h % 240);
  const turbidity = Number((0.2 + ((h >> 5) % 30) / 10).toFixed(1));
  const safe = tds <= 500 && ph >= 6.5 && ph <= 8.5 && turbidity <= 5;
  const zoneName = NS_DATA.states[h % NS_DATA.states.length] || "India";
  return {
    pincode: pin,
    tds,
    ph,
    hardness,
    turbidity,
    safe,
    status: safe ? "Safe" : "Unsafe",
    zone: zoneName,
    testedOn: new Date().toISOString().slice(0, 10),
    lab: "District Public Health Laboratory",
    source: "Demo model (BIS 10500 reference)"
  };
}
