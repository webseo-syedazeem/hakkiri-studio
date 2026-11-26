import type { ExampleSpec } from "../types";

const CLOSE = {
  uk: "My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
  us: "My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
};

/**
 * Service industries: flying (a first officer and cabin crew), a warehouse,
 * mortgage advice and selling homes. UK versions carry UK licences (CAA,
 * CeMAP, Propertymark); US versions carry US ones (FAA, NMLS, a state real
 * estate license).
 */
export const INDUSTRY_SERVICES: ExampleSpec[] = [
  {
    id: "first-officer",
    industry: "aviation",
    role: "First Officer",
    level: "experienced",
    template: "standard",
    blurb: {
      uk: "An Airbus A320 first officer with 5,650 hours, a full ATPL and a safety pilot role in line training.",
      us: "An Airbus A320 first officer with 5,650 hours, an FAA ATP certificate and regional jet experience.",
    },
    person: { name: "Daniel Hartley", email: "daniel.hartley@example.com", phone: { uk: "07700 900301", us: "(303) 555-0116" }, location: { uk: "Manchester", us: "Denver, CO" } },
    profile: {
      uk: "First officer with 5,650 flight hours, 2,900 of them on the Airbus A320, flying short-haul routes across the UK and Europe. Holds a full UK Airline Transport Pilot Licence (ATPL), an A320 type rating and a Class 1 medical. Passed 9 simulator checks and 4 line checks in 4 years, each at the first attempt. Flies as safety pilot for new first officers in line training and is working towards a command.",
      us: "First officer with 5,650 flight hours, 2,900 of them on the Airbus A320, flying routes across the US, Canada and Mexico. Holds a Federal Aviation Administration (FAA) Airline Transport Pilot certificate, an A320 type rating and a first-class medical. Passed 9 simulator checks and 4 line checks in 4 years, each at the first attempt. Mentors new-hire first officers and is working toward an upgrade to captain.",
    },
    experience: [
      {
        title: "First Officer, Airbus A320",
        org: { uk: "Aldermoor Airways", us: "Westvale Airlines" },
        location: { uk: "Manchester", us: "Denver, CO" },
        start: "2022-05",
        current: true,
        bullets: [
          {
            uk: "Fly around 650 hours a year on the Airbus A320 from the Manchester base, on 45 routes across the UK and Europe",
            us: "Fly around 650 hours a year on the Airbus A320 from the Denver base, on 45 routes across the US, Canada and Mexico",
          },
          "Share pilot flying and pilot monitoring duties with the captain on up to 4 flights a day, using crew resource management (CRM) and threat and error management in every briefing",
          "Ran the checklists as pilot monitoring for 6 in-flight technical failures and 3 medical diversions, following standard operating procedures (SOPs) to a safe landing each time",
          "Passed 9 simulator checks and 4 line checks in 4 years, each at the first attempt",
          {
            uk: "Fly as safety pilot for new first officers in the line training phase, sitting in on 60 flights for 14 trainees since 2024",
            us: "Mentor 6 new-hire first officers through the pilot mentoring program, meeting each one monthly in their first year",
          },
          "Filed 22 reports through the safety management system (SMS), 3 of which led to changes in approach briefings for the fleet",
        ],
      },
      {
        title: { uk: "First Officer, ATR 72", us: "First Officer, Embraer E175" },
        org: { uk: "Fellside Air", us: "Juniper Regional Airlines" },
        location: { uk: "Newcastle", us: "Salt Lake City, UT" },
        start: "2018-11",
        end: "2022-04",
        bullets: [
          {
            uk: "Flew 1,750 hours on the ATR 72 on up to 6 short flights a day to 14 airports in the UK and Ireland, including island runways",
            us: "Flew 1,750 hours on the Embraer E175 on up to 5 flights a day to 30 airports across the western US, including mountain airports",
          },
          {
            uk: "Completed weight and balance (load and trim) sheets for up to 6 flights a day, with no errors found in 3 company audits",
            us: "Calculated takeoff performance and weight and balance for up to 5 flights a day, with no errors found in 3 company audits",
          },
          "Coordinated deicing with ground crews on around 150 winter departures a year, keeping the average deicing delay to 9 minutes",
          {
            uk: "Wrote a 12-page guide to all 14 airports on the network, used in the line training of 20 new first officers",
            us: "Wrote a 12-page guide to 6 mountain airports on the network, used in the line training of 20 new first officers",
          },
        ],
      },
      {
        title: { uk: "Flight Instructor", us: "Certified Flight Instructor" },
        org: { uk: "Solent Flight Academy", us: "Red River Flight Center" },
        location: { uk: "Southampton", us: "Grand Forks, ND" },
        start: "2016-09",
        end: "2018-10",
        bullets: [
          "Taught 30 student pilots in the aircraft and on the ground, logging 750 hours of flight instruction",
          {
            uk: "Prepared 18 students for the Private Pilot Licence (PPL) skill test over 2 years, with 16 passing at the first attempt",
            us: "Prepared 18 students for the private pilot practical test over 2 years, with 16 passing on the first attempt",
          },
          {
            uk: "Ran ground school classes on weather, air law and flight planning for groups of up to 8 students",
            us: "Ran ground school classes on weather, regulations and flight planning for groups of up to 8 students",
          },
          {
            uk: "Kept training files for 30 students up to date for 2 school audits by the Civil Aviation Authority (CAA), with no findings",
            us: "Kept training records for 30 students up to date for 2 school audits by the FAA, with no findings",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "Integrated Airline Transport Pilot Licence course", us: "Bachelor of Science in Commercial Aviation" },
        org: { uk: "Solent Flight Academy", us: "University of North Dakota" },
        end: "2016",
        grade: { uk: "Frozen ATPL, 14 theory exams passed", us: "GPA 3.6" },
      },
    ],
    certificates: [
      { title: { uk: "Airline Transport Pilot Licence (ATPL), aeroplanes", us: "Airline Transport Pilot certificate, multi-engine" }, org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" } },
      { title: "Airbus A320 type rating", org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" }, end: "2022" },
      { title: { uk: "Class 1 medical certificate", us: "First-class medical certificate" }, org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" } },
      { title: { uk: "Flight Instructor rating", us: "Certified Flight Instructor, instrument and multi-engine" }, org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" }, end: "2016" },
    ],
    skills: [
      "Airbus A320",
      { uk: "ATR 72", us: "Embraer E175" },
      "Crew resource management",
      "Threat and error management",
      "Standard operating procedures",
      "Safety management system",
      "Weight and balance",
      "Deicing",
      "Line training",
      "Flight instruction",
    ],
    names: ["Hartley", "Aldermoor", "Westvale", "Fellside", "Solent", "Seabright", "A320", "ATR", "Embraer", "E175"],
    letter: {
      job: {
        title: "First Officer, Airbus A320",
        employer: { uk: "Seabright Airways", us: "Seabright Airlines" },
        advert: {
          uk: `First Officer, Airbus A320
Seabright Airways, Bristol

Seabright Airways flies to 60 airports in the UK and Europe from 4 bases.

The role
You will fly the Airbus A320 from our Bristol base, sharing the flying with the captain on up to 4 flights a day.

What we are looking for
- A full UK Airline Transport Pilot Licence with a current A320 type rating
- A valid Class 1 medical
- At least 1,500 hours on multi-crew aircraft
- Sound crew resource management and a strong safety culture`,
          us: `First Officer, Airbus A320
Seabright Airlines, Seattle, WA

Seabright Airlines flies to 60 airports in the US, Canada and Mexico from 4 bases.

The role
You will fly the Airbus A320 from our Seattle base, sharing the flying with the captain on up to 4 flights a day.

What we are looking for
- An FAA Airline Transport Pilot certificate, with an A320 type rating preferred
- A current FAA first-class medical
- At least 1,500 hours in turbine aircraft
- Sound crew resource management and a strong safety culture`,
        },
      },
      reason: {
        uk: "My family lives in Bristol, and I want to fly from a base close to home. I also want to keep flying the A320.",
        us: "My family lives in Seattle, and I want to fly from a base close to home. I also want to keep flying the A320.",
      },
      recipient: "Captain Shaw",
      paragraphs: [
        {
          uk: "I am applying for the role of First Officer, Airbus A320 at Seabright Airways. My family lives in Bristol, and I want to fly from a base close to home. I also want to keep flying the A320.",
          us: "I am applying for the role of First Officer, Airbus A320 at Seabright Airlines. My family lives in Seattle, and I want to fly from a base close to home. I also want to keep flying the A320.",
        },
        {
          uk: "At Aldermoor Airways I fly around 650 hours a year on the Airbus A320 from the Manchester base, on 45 routes across the UK and Europe. I share pilot flying and pilot monitoring duties with the captain on up to 4 flights a day, using crew resource management (CRM) and threat and error management in every briefing.",
          us: "At Westvale Airlines I fly around 650 hours a year on the Airbus A320 from the Denver base, on 45 routes across the US, Canada and Mexico. I share pilot flying and pilot monitoring duties with the captain on up to 4 flights a day, using crew resource management (CRM) and threat and error management in every briefing.",
        },
        {
          uk: "Your advert asks for at least 1,500 hours on multi-crew aircraft. I have 5,650 flight hours, 2,900 of them on the Airbus A320. I also flew 1,750 hours on the ATR 72 at Fellside Air, on up to 6 short flights a day to 14 airports in the UK and Ireland.",
          us: "Your advert asks for at least 1,500 hours in turbine aircraft. I have 5,650 flight hours, 2,900 of them on the Airbus A320. I also flew 1,750 hours on the Embraer E175 at Juniper Regional Airlines, on up to 5 flights a day to 30 airports across the western US.",
        },
        "Your advert asks for sound crew resource management and a strong safety culture. I filed 22 reports through the safety management system (SMS), 3 of which led to changes in approach briefings for the fleet. I have also passed 9 simulator checks and 4 line checks in 4 years, each at the first attempt.",
        {
          uk: "Your advert asks for a full UK Airline Transport Pilot Licence with a current A320 type rating. I hold a full UK Airline Transport Pilot Licence (ATPL), an A320 type rating and a Class 1 medical.",
          us: "Your advert asks for an FAA Airline Transport Pilot certificate, with an A320 type rating preferred. I hold a Federal Aviation Administration (FAA) Airline Transport Pilot certificate, an A320 type rating and a first-class medical.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "cabin-crew",
    industry: "aviation",
    role: { uk: "Cabin Crew", us: "Flight Attendant" },
    level: "early",
    template: "compact",
    blurb: {
      uk: "Cabin crew on the Airbus A321, two and a half years in, with a background in hotel customer service.",
      us: "A flight attendant on the Airbus A321, two and a half years in, with a background in hotel guest service.",
    },
    person: { name: "Megan Lloyd", email: "megan.lloyd@example.com", phone: { uk: "07700 900302", us: "(214) 555-0117" }, location: { uk: "Crawley", us: "Dallas, TX" } },
    profile: {
      uk: "Cabin crew member with two and a half years flying from London Gatwick on the Airbus A321, after nearly 3 years in customer service at a busy airport hotel. Holds a cabin crew attestation and passes yearly safety and emergency procedures training. Gave first aid to 9 passengers and calmed 6 disruptive passengers in 2025. Speaks conversational Spanish.",
      us: "Flight attendant with two and a half years flying from Dallas on the Airbus A321, after nearly 3 years in customer service at a busy airport hotel. Holds a Federal Aviation Administration (FAA) Certificate of Demonstrated Proficiency and passes yearly safety and emergency procedures training. Gave first aid to 9 passengers and calmed 6 disruptive passengers in 2025. Speaks conversational Spanish.",
    },
    experience: [
      {
        title: { uk: "Cabin Crew Member", us: "Flight Attendant" },
        org: { uk: "Larkfield Airways", us: "Larkfield Airlines" },
        location: { uk: "London Gatwick", us: "Dallas, TX" },
        start: "2024-04",
        current: true,
        bullets: [
          {
            uk: "Serve up to 220 passengers a flight on the Airbus A321, working up to 4 flights a day in a crew of 5",
            us: "Serve up to 190 passengers a flight on the Airbus A321, working up to 4 flights a day in a crew of 4",
          },
          {
            uk: "Give the safety demonstration and secure the cabin for take-off and landing on every flight, passing 3 cabin line checks with no findings",
            us: "Give the safety demonstration and secure the cabin for takeoff and landing on every flight, passing 3 in-flight evaluations with no findings",
          },
          {
            uk: "Check oxygen, fire and first aid equipment before every flight, reporting 12 faults to engineers in 2025 before departure",
            us: "Check oxygen, fire and first aid equipment before every flight, reporting 12 faults to maintenance in 2025 before departure",
          },
          {
            uk: "Average £1,400 of onboard sales a month in food, drinks and duty-free goods, placing in the top 10% of 300 crew at the base for 5 months",
            us: "Took 70 credit card applications from passengers in 2025, in the top 10% of 300 flight attendants at the Dallas base",
          },
          {
            uk: "Gave first aid to 9 passengers in 2025, including a passenger with chest pain on a flight that diverted to Lyon",
            us: "Gave first aid to 9 passengers in 2025, including a passenger with chest pain on a flight that diverted to Memphis",
          },
          "Calmed 6 disruptive passengers in 2025 using conflict resolution training, with only 1 needing police on arrival",
        ],
      },
      {
        title: { uk: "Hotel Receptionist", us: "Front Desk Agent" },
        org: "Harlow Grange Hotel",
        location: { uk: "Horley", us: "Irving, TX" },
        start: "2021-07",
        end: "2024-03",
        bullets: [
          "Checked in up to 120 guests a shift at a 280-room airport hotel, many arriving late after delayed flights",
          "Resolved around 15 guest complaints a week at the desk, keeping the hotel's review score at 4.5 out of 5",
          {
            uk: "Took around £30,000 a week in card and cash payments, with the till balanced at the end of every shift",
            us: "Took around $38,000 a week in card and cash payments, with the register balanced at the end of every shift",
          },
          {
            uk: "Trained 5 new receptionists on the booking system and check-in steps, each working alone within 2 weeks",
            us: "Trained 5 new front desk agents on the booking system and check-in steps, each working alone within 2 weeks",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BTEC Level 3 Extended Diploma in Travel and Tourism", us: "Associate of Applied Science in Hospitality Management" },
        org: { uk: "Tilgate College", us: "Dallas College" },
        start: "2019-09",
        end: "2021-06",
        grade: { uk: "Distinction, Distinction, Merit", us: "GPA 3.5" },
      },
    ],
    certificates: [
      { title: { uk: "Cabin crew attestation", us: "Certificate of Demonstrated Proficiency" }, org: { uk: "UK Civil Aviation Authority", us: "Federal Aviation Administration" }, end: "2024" },
      { title: "Safety and emergency procedures, Airbus A321 (yearly recurrent training)", org: { uk: "Larkfield Airways", us: "Larkfield Airlines" }, end: "2026" },
    ],
    skills: [
      "Safety and emergency procedures",
      "Safety demonstrations",
      "First aid",
      "Customer service",
      "Conflict resolution",
      { uk: "Onboard sales", us: "Credit card applications" },
      "Resolving complaints",
      "Booking systems",
      "Airbus A321",
    ],
    languages: [
      { name: "English", level: "Native" },
      { name: "Spanish", level: "Conversational" },
    ],
    names: ["Larkfield", "Silverbirch", "Crawley", "Gatwick", "Horley", "Tilgate", "A321", "BTEC"],
    letter: {
      job: {
        title: { uk: "Cabin Crew Member", us: "Flight Attendant" },
        employer: { uk: "Silverbirch Airways", us: "Silverbirch Airlines" },
        advert: {
          uk: `Cabin Crew Member
Silverbirch Airways, London Gatwick

Silverbirch Airways flies to 50 holiday destinations in Europe and North Africa.

The role
You will look after the safety and comfort of our passengers on the Airbus A321, on flights of up to 5 hours.

What we are looking for
- At least a year of flying as cabin crew, with a current attestation
- Calm, friendly customer service and the ability to handle conflict
- Confidence with onboard sales
- First aid skills
- A second language is a bonus`,
          us: `Flight Attendant
Silverbirch Airlines, Dallas, TX

Silverbirch Airlines flies to 50 destinations across the US, Mexico and the Caribbean.

The role
You will look after the safety and comfort of our passengers on the Airbus A321, on flights of up to 5 hours.

What we are looking for
- At least a year of experience as a flight attendant, with a current FAA Certificate of Demonstrated Proficiency
- Calm, friendly customer service and the ability to handle conflict
- First aid skills
- A second language is a plus`,
        },
      },
      reason: {
        uk: "I want to fly longer routes to holiday destinations. Silverbirch flies from Gatwick, so I can stay close to home.",
        us: "I want to fly longer routes to beach destinations. Silverbirch has a base in Dallas, so I can stay close to home.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Cabin Crew Member at Silverbirch Airways. I want to fly longer routes to holiday destinations. Silverbirch flies from Gatwick, so I can stay close to home.",
          us: "I am applying for the role of Flight Attendant at Silverbirch Airlines. I want to fly longer routes to beach destinations. Silverbirch has a base in Dallas, so I can stay close to home.",
        },
        {
          uk: "At Larkfield Airways I serve up to 220 passengers a flight on the Airbus A321, working up to 4 flights a day in a crew of 5. I also give the safety demonstration and secure the cabin for take-off and landing on every flight, passing 3 cabin line checks with no findings.",
          us: "At Larkfield Airlines I serve up to 190 passengers a flight on the Airbus A321, working up to 4 flights a day in a crew of 4. I also give the safety demonstration and secure the cabin for takeoff and landing on every flight, passing 3 in-flight evaluations with no findings.",
        },
        "Your advert asks for calm, friendly customer service and the ability to handle conflict. I calmed 6 disruptive passengers in 2025 using conflict resolution training, with only 1 needing police on arrival. At Harlow Grange Hotel I resolved around 15 guest complaints a week at the desk, keeping the hotel's review score at 4.5 out of 5.",
        {
          uk: "Your advert asks for confidence with onboard sales. I average £1,400 of onboard sales a month in food, drinks and duty-free goods, placing in the top 10% of 300 crew at the base for 5 months.",
          us: "Your advert asks for first aid skills. I gave first aid to 9 passengers in 2025, including a passenger with chest pain on a flight that diverted to Memphis.",
        },
        {
          uk: "Your advert asks for first aid skills. I gave first aid to 9 passengers in 2025, including a passenger with chest pain on a flight that diverted to Lyon. Your advert also says a second language is a bonus. I speak conversational Spanish.",
          us: "I also took 70 credit card applications from passengers in 2025, in the top 10% of 300 flight attendants at the Dallas base. Your advert also says a second language is a plus. I speak conversational Spanish.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "warehouse-operative",
    industry: "logistics",
    role: { uk: "Warehouse Operative", us: "Warehouse Associate" },
    level: "early",
    template: "compact",
    density: { uk: "default", us: "tighter" },
    blurb: {
      uk: "A warehouse operative who picks above target and drives counterbalance forklifts and reach trucks.",
      us: "A warehouse associate who picks above target and is certified on sit-down and stand-up forklifts.",
    },
    person: { name: "Liam Carter", email: "liam.carter@example.com", phone: { uk: "07700 900303", us: "(614) 555-0118" }, location: { uk: "Northampton", us: "Columbus, OH" } },
    profile: {
      uk: "Warehouse operative with 4 years in warehouses, picking around 160 order lines an hour against a site target of 140. Holds counterbalance forklift and reach truck licences and unloads 6 to 8 trailers a shift. Keeps picking accuracy at 99.8% and has trained 9 new starters on the scanner. Happy to work nights, weekends and overtime during peak.",
      us: "Warehouse associate with 4 years in warehouses, picking around 160 order lines an hour against a site target of 140. Certified on sit-down counterbalance forklifts and stand-up reach trucks, and unloads 6 to 8 trailers a shift. Keeps picking accuracy at 99.8% and has trained 9 new hires on the scanner. Happy to work nights, weekends and overtime during peak season.",
    },
    experience: [
      {
        title: { uk: "Warehouse Operative", us: "Warehouse Associate" },
        org: "Calderbrook Distribution",
        location: { uk: "Daventry", us: "Groveport, OH" },
        start: "2023-02",
        current: true,
        bullets: [
          "Pick around 160 order lines an hour with a handheld scanner for 220 stores, against a site target of 140",
          "Keep picking accuracy at 99.8% over the last 12 months, checked line by line in the warehouse management system (WMS)",
          {
            uk: "Drive counterbalance forklifts and reach trucks to unload 6 to 8 trailers a shift and put away up to 300 pallets",
            us: "Drive sit-down counterbalance forklifts and stand-up reach trucks to unload 6 to 8 trailers a shift and put away up to 300 pallets",
          },
          {
            uk: "Count 120 pick locations a week for stock checks, finding errors that cut stock losses by £18,000 in 2025",
            us: "Count 120 pick locations a week for stock checks, finding errors that cut stock losses by $22,000 in 2025",
          },
          {
            uk: "Trained 9 new starters on the scanner and safe picking, each working alone within a week",
            us: "Trained 9 new hires on the scanner and safe picking, each working alone within a week",
          },
          {
            uk: "Reported 14 near misses in 2025 through the health and safety system, 4 of which led to changes such as new floor markings by the loading bay doors",
            us: "Reported 14 near misses in 2025 through the workplace safety system, 4 of which led to changes such as new floor markings by the dock doors",
          },
        ],
      },
      {
        title: { uk: "Seasonal Warehouse Operative", us: "Seasonal Warehouse Associate" },
        org: "Swiftline Parcels",
        location: { uk: "Northampton", us: "Columbus, OH" },
        start: "2022-10",
        end: "2023-01",
        bullets: [
          {
            uk: "Sorted around 900 parcels an hour onto a conveyor line during the Christmas peak",
            us: "Sorted around 900 packages an hour onto a conveyor line during the holiday peak",
          },
          {
            uk: "Loaded 10 delivery vans a shift in drop order, cutting driver start times by 15 minutes",
            us: "Loaded 10 delivery vans a shift in stop order, cutting driver start times by 15 minutes",
          },
          "Kept 100% attendance over 16 weeks of peak, including 12 weekend shifts",
        ],
      },
      {
        title: { uk: "Customer Assistant", us: "Store Associate" },
        org: { uk: "Hollins Supermarkets", us: "Hollins Market" },
        location: { uk: "Northampton", us: "Columbus, OH" },
        start: "2020-09",
        end: "2022-09",
        bullets: [
          {
            uk: "Replenished shelves on the night shift from 2 deliveries of up to 30 roll cages a night",
            us: "Restocked shelves on the night shift from 2 deliveries of up to 12 pallets a night",
          },
          {
            uk: "Rotated chilled stock by date across 12 fridges, cutting waste in the section by 12% in 6 months",
            us: "Rotated dairy and deli stock by date across 12 coolers, cutting waste in the department by 12% in 6 months",
          },
          {
            uk: "Served around 300 customers a shift on the tills, 2 day shifts a week",
            us: "Ran a register on 2 day shifts a week, serving around 300 customers a shift",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "GCSEs: 6 at grades 9 to 4, including English and maths", us: "High School Diploma" },
        org: { uk: "Thornton Park Academy", us: "Hilltop Ridge High School" },
        end: "2020",
      },
    ],
    certificates: [
      {
        title: { uk: "Counterbalance forklift licence, RTITB accredited", us: "Forklift certification, sit-down counterbalance (OSHA powered industrial truck standard)" },
        org: "Calderbrook Distribution",
        end: "2023",
      },
      { title: { uk: "Reach truck licence, RTITB accredited", us: "Forklift certification, stand-up reach truck" }, org: "Calderbrook Distribution", end: "2024" },
      { title: { uk: "Emergency First Aid at Work", us: "First aid and CPR" }, org: "Calderbrook Distribution", end: "2025" },
    ],
    skills: [
      "Order picking",
      "Handheld scanners",
      "Warehouse management system",
      "Counterbalance forklifts",
      "Reach trucks",
      "Unloading trailers",
      "Stock counts",
      { uk: "Health and safety", us: "Workplace safety" },
      { uk: "Training new starters", us: "Training new hires" },
    ],
    names: ["Liam", "Calderbrook", "Groveport", "Swiftline", "Hollins", "Daventry", "Ashworth", "RTITB"],
    letter: {
      job: {
        title: { uk: "Reach Truck Operative", us: "Reach Truck Operator" },
        employer: "Ashworth Logistics",
        advert: {
          uk: `Reach Truck Operative
Ashworth Logistics, Northampton

Ashworth Logistics runs a 300,000 sq ft warehouse for 3 food and drink brands.

The role
You will put away and replenish stock with a reach truck, on a 4-on, 4-off shift pattern.

What we are looking for
- A current reach truck licence
- Experience with a warehouse management system and handheld scanners
- High standards of accuracy and safety
- Willingness to work nights and weekends`,
          us: `Reach Truck Operator
Ashworth Logistics, Columbus, OH

Ashworth Logistics runs a 300,000 sq ft warehouse for 3 food and beverage brands.

The role
You will put away and replenish stock with a stand-up reach truck, on a 4-on, 4-off shift schedule.

What we are looking for
- Forklift certification on a stand-up reach truck
- Experience with a warehouse management system and handheld scanners
- High standards of accuracy and safety
- Willingness to work nights and weekends`,
        },
      },
      reason: "I want to spend more of my shifts driving a reach truck. Ashworth is 10 minutes from my home.",
      recipient: { uk: "Mr Hughes", us: "Mr. Hughes" },
      paragraphs: [
        {
          uk: "I am applying for the role of Reach Truck Operative at Ashworth Logistics. I want to spend more of my shifts driving a reach truck. Ashworth is 10 minutes from my home.",
          us: "I am applying for the role of Reach Truck Operator at Ashworth Logistics. I want to spend more of my shifts driving a reach truck. Ashworth is 10 minutes from my home.",
        },
        {
          uk: "At Calderbrook Distribution I pick around 160 order lines an hour with a handheld scanner for 220 stores, against a site target of 140. I drive counterbalance forklifts and reach trucks to unload 6 to 8 trailers a shift and put away up to 300 pallets.",
          us: "At Calderbrook Distribution I pick around 160 order lines an hour with a handheld scanner for 220 stores, against a site target of 140. I drive sit-down counterbalance forklifts and stand-up reach trucks to unload 6 to 8 trailers a shift and put away up to 300 pallets.",
        },
        {
          uk: "Your advert asks for experience with a warehouse management system and handheld scanners. I keep picking accuracy at 99.8% over the last 12 months, checked line by line in the warehouse management system (WMS). At Swiftline Parcels I sorted around 900 parcels an hour onto a conveyor line during the Christmas peak.",
          us: "Your advert asks for experience with a warehouse management system and handheld scanners. I keep picking accuracy at 99.8% over the last 12 months, checked line by line in the warehouse management system (WMS). At Swiftline Parcels I sorted around 900 packages an hour onto a conveyor line during the holiday peak.",
        },
        {
          uk: "Your advert asks for high standards of accuracy and safety. I reported 14 near misses in 2025 through the health and safety system, 4 of which led to changes such as new floor markings by the loading bay doors. I also hold a reach truck licence, RTITB accredited, and I trained 9 new starters on the scanner and safe picking.",
          us: "Your advert asks for high standards of accuracy and safety. I reported 14 near misses in 2025 through the workplace safety system, 4 of which led to changes such as new floor markings by the dock doors. I also trained 9 new hires on the scanner and safe picking, each working alone within a week.",
        },
        {
          uk: "I am happy to work nights, weekends and overtime during peak. My CV is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
          us: "I am happy to work nights, weekends and overtime during peak season. My resume is attached, and I would welcome the chance to discuss the role. Thank you for your time and consideration.",
        },
      ],
    },
  },
  {
    id: "mortgage-adviser",
    industry: "banking",
    role: { uk: "Mortgage Adviser", us: "Loan Officer" },
    level: "senior",
    template: "standard",
    blurb: {
      uk: "A senior mortgage adviser at a whole-of-market broker who coaches trainee advisers.",
      us: "A senior loan officer with $54 million in closed loans last year who coaches new loan officers.",
    },
    person: { name: "Rachel Thornton", email: "rachel.thornton@example.com", phone: { uk: "07700 900304", us: "(602) 555-0119" }, location: { uk: "Nottingham", us: "Phoenix, AZ" } },
    profile: {
      uk: "Senior mortgage adviser with 11 years of mortgage advice, the last 6 at a whole-of-market broker. Completed 165 mortgages worth £38 million in 2025, the highest total among 12 advisers at the firm. Holds CeMAP and CeRER, and coaches 4 trainee advisers to competence. Keeps a 4.9 out of 5 rating from 310 client reviews, with 45% of new clients coming from referrals.",
      us: "Senior loan officer with 11 years in mortgage lending, the last 6 at an independent mortgage lender. Closed 150 loans worth $54 million in 2025, the highest total among 12 loan officers at the company. Licensed through the Nationwide Multistate Licensing System (NMLS) in Arizona and California, and coaches 4 new loan officers. Keeps a 4.9 out of 5 rating from 310 borrower reviews, with 45% of new borrowers coming from referrals.",
    },
    experience: [
      {
        title: { uk: "Senior Mortgage Adviser", us: "Senior Loan Officer" },
        org: { uk: "Lindenfield Mortgages", us: "Lindenfield Home Loans" },
        location: { uk: "Nottingham", us: "Phoenix, AZ" },
        start: "2020-03",
        current: true,
        bullets: [
          {
            uk: "Advise around 30 clients a month on residential and buy-to-let mortgages and remortgages, choosing from a panel of 90 lenders",
            us: "Advise around 30 borrowers a month on purchase and refinance loans, including conventional, Federal Housing Administration (FHA) and Veterans Affairs (VA) loans",
          },
          {
            uk: "Completed 165 mortgages worth £38 million in 2025, the highest total among 12 advisers at the firm",
            us: "Closed 150 loans worth $54 million in 2025, the highest total among 12 loan officers at the company",
          },
          {
            uk: "Arrange life, critical illness and income protection insurance for 60% of mortgage clients, against a firm average of 35%",
            us: "Keep the pull-through rate from application to closing at 78%, against a company average of 64%",
          },
          {
            uk: "Passed 98% of 420 case files at the first compliance check over 3 years, against a firm average of 91%",
            us: "Passed 98% of 420 loan files at the first compliance review over 3 years, against a company average of 91%",
          },
          {
            uk: "Coach 4 trainee advisers through CeMAP and their first 50 cases, with all 4 signed off as competent within 9 months",
            us: "Coach 4 new loan officers through their licensing exam and first 50 loans, with all 4 closing loans alone within 9 months",
          },
          {
            uk: "Rewrote the suitability letter template for the Financial Conduct Authority (FCA) Consumer Duty in 2023, adopted by all 12 advisers",
            us: "Rewrote the closing disclosure checklist in 2023, cutting late changes at closing by 40% across 12 loan officers",
          },
        ],
      },
      {
        title: { uk: "Mortgage Adviser", us: "Loan Officer" },
        org: { uk: "Eastgate Building Society", us: "Saguaro Credit Union" },
        location: { uk: "Derby", us: "Tempe, AZ" },
        start: "2015-06",
        end: "2020-02",
        bullets: [
          {
            uk: "Advised around 25 members a month on the society's own mortgages as a tied adviser across 3 branches",
            us: "Originated around 25 loans a month for credit union members across 3 branches",
          },
          {
            uk: "Completed £21 million of mortgage lending in 2019, reaching 115% of target",
            us: "Closed $26 million in mortgage loans in 2019, reaching 115% of goal",
          },
          {
            uk: "Cut the time from application to mortgage offer from 24 to 16 days by checking documents before submission",
            us: "Cut the time from application to closing from 42 to 31 days by collecting all documents at the first meeting",
          },
          {
            uk: "Ran quarterly first-time buyer events in 3 branches, each drawing around 40 people",
            us: "Ran quarterly first-time home buyer seminars in 3 branches, each drawing around 40 members",
          },
          {
            uk: "Moved around 140 members a year onto new deals as their fixed rates ended, keeping 85% of them with the society",
            us: "Refinanced around 140 members a year out of adjustable-rate loans, keeping 85% of them with the credit union",
          },
        ],
      },
      {
        title: { uk: "Customer Adviser", us: "Personal Banker" },
        org: { uk: "Eastgate Building Society", us: "Saguaro Credit Union" },
        location: { uk: "Derby", us: "Tempe, AZ" },
        start: "2012-09",
        end: "2015-05",
        bullets: [
          {
            uk: "Served around 60 members a day at the counter and on the phone, opening around 30 savings accounts a month",
            us: "Served around 60 members a day in the branch and on the phone, opening around 30 checking and savings accounts a month",
          },
          {
            uk: "Passed all 3 CeMAP exams in 14 months while working full time, each at the first attempt",
            us: "Passed the national mortgage loan originator exam in 2015 at the first attempt, while working full time",
          },
          {
            uk: "Referred 20 members a month to the mortgage team, with 1 in 4 going on to take a mortgage",
            us: "Referred 20 members a month to loan officers, with 1 in 4 going on to take out a home loan",
          },
        ],
      },
    ],
    volunteering: [
      {
        title: { uk: "Volunteer money mentor", us: "Volunteer instructor, first-time home buyer classes" },
        org: { uk: "Sneinton Community Money Advice", us: "Valley Housing Counseling Center" },
        start: "2018-04",
        current: true,
        bullets: [
          {
            uk: "Run a monthly budgeting session for around 12 people at a community centre, covering credit files, debt and saving for a deposit",
            us: "Teach a monthly class for around 20 first-time home buyers, with a focus on credit scores, budgeting and saving for a down payment",
          },
          {
            uk: "Wrote a 6-page guide to credit files, given to around 150 people since 2019",
            us: "Wrote a 6-page guide to credit scores, given to around 400 class members since 2019",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Business Management", us: "Bachelor of Science in Finance" },
        org: { uk: "Nottingham Trent University", us: "Arizona State University" },
        end: "2012",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      {
        title: { uk: "Certificate in Mortgage Advice and Practice (CeMAP)", us: "Mortgage loan originator license, Arizona" },
        org: { uk: "London Institute of Banking & Finance", us: "Nationwide Multistate Licensing System (NMLS)" },
        end: "2015",
      },
      {
        title: { uk: "Certificate in Regulated Equity Release (CeRER)", us: "Mortgage loan originator license, California" },
        org: { uk: "London Institute of Banking & Finance", us: "Nationwide Multistate Licensing System (NMLS)" },
        end: "2021",
      },
    ],
    skills: [
      { uk: "Residential mortgages", us: "Conventional loans" },
      { uk: "Buy-to-let", us: "FHA and VA loans" },
      { uk: "Remortgages", us: "Refinance loans" },
      { uk: "Protection insurance", us: "Pull-through rate" },
      "Compliance",
      { uk: "Consumer Duty", us: "Closing disclosures" },
      { uk: "Coaching advisers", us: "Coaching loan officers" },
      { uk: "First-time buyers", us: "First-time home buyers" },
      { uk: "Client referrals", us: "Borrower referrals" },
    ],
    names: ["Lindenfield", "Eastgate", "Oakhurst", "Sneinton", "CeMAP", "CeRER", "Multistate"],
    letter: {
      job: {
        title: { uk: "Mortgage Team Leader", us: "Producing Branch Manager" },
        employer: { uk: "Oakhurst Mortgage Partners", us: "Oakhurst Home Loans" },
        advert: {
          uk: `Mortgage Team Leader
Oakhurst Mortgage Partners, Nottingham (hybrid)

Oakhurst Mortgage Partners is a whole-of-market broker with 20 advisers in the East Midlands.

The role
You will lead a team of 6 mortgage advisers while keeping a smaller caseload of your own.

What we are looking for
- CeMAP or an equivalent qualification
- At least 5 years as a mortgage adviser, with strong completion numbers
- Experience coaching and signing off new advisers
- A clear grasp of FCA rules and the Consumer Duty
- Protection advice as part of every case`,
          us: `Producing Branch Manager
Oakhurst Home Loans, Phoenix, AZ (hybrid)

Oakhurst Home Loans is an independent mortgage lender licensed in 8 states.

The role
You will lead a branch of 6 loan officers while keeping a pipeline of your own loans.

What we are looking for
- An active Arizona mortgage loan originator license through NMLS
- At least 5 years as a loan officer, with strong closed loan volume
- Experience coaching and developing new loan officers
- A clear grasp of compliance and closing disclosures
- Strong relationships with real estate agents and builders`,
        },
      },
      reason: {
        uk: "I want to lead a team of advisers while still advising clients myself. I also want to stay with a whole-of-market broker.",
        us: "I want to lead a team of loan officers while still working with borrowers myself. I also want to stay with an independent mortgage lender.",
      },
      recipient: { uk: "Ms Ahmed", us: "Ms. Ahmed" },
      paragraphs: [
        {
          uk: "I am applying for the role of Mortgage Team Leader at Oakhurst Mortgage Partners. I want to lead a team of advisers while still advising clients myself. I also want to stay with a whole-of-market broker.",
          us: "I am applying for the role of Producing Branch Manager at Oakhurst Home Loans. I want to lead a team of loan officers while still working with borrowers myself. I also want to stay with an independent mortgage lender.",
        },
        {
          uk: "At Lindenfield Mortgages I advise around 30 clients a month on residential and buy-to-let mortgages and remortgages, choosing from a panel of 90 lenders. I completed 165 mortgages worth £38 million in 2025, the highest total among 12 advisers.",
          us: "At Lindenfield Home Loans I advise around 30 borrowers a month on purchase and refinance loans, including conventional, Federal Housing Administration (FHA) and Veterans Affairs (VA) loans. I closed 150 loans worth $54 million in 2025, the highest total among 12 loan officers.",
        },
        {
          uk: "Your advert asks for experience coaching and signing off new advisers. I coach 4 trainee advisers through CeMAP and their first 50 cases, with all 4 signed off as competent within 9 months.",
          us: "Your advert asks for experience coaching and developing new loan officers. I coach 4 new loan officers through their licensing exam and first 50 loans, with all 4 closing loans alone within 9 months.",
        },
        {
          uk: "Your advert asks for a clear grasp of FCA rules and the Consumer Duty. I rewrote the suitability letter template for the Financial Conduct Authority (FCA) Consumer Duty in 2023, adopted by all 12 advisers. I also passed 98% of 420 case files at the first compliance check over 3 years, against a firm average of 91%.",
          us: "Your advert asks for a clear grasp of compliance and closing disclosures. I passed 98% of 420 loan files at the first compliance review over 3 years, against a company average of 91%. I also rewrote the closing disclosure checklist in 2023, cutting late changes at closing by 40% across 12 loan officers.",
        },
        {
          uk: "Your advert asks for protection advice as part of every case. I arrange life, critical illness and income protection insurance for 60% of mortgage clients, against a firm average of 35%.",
          us: "Your advert asks for an active Arizona mortgage loan originator license through NMLS. I am licensed through the Nationwide Multistate Licensing System (NMLS) in Arizona and California.",
        },
        CLOSE,
      ],
    },
  },
  {
    id: "estate-agent",
    industry: "property",
    role: { uk: "Estate Agent", us: "Real Estate Agent" },
    level: "experienced",
    template: "modern",
    blurb: {
      uk: "A senior sales negotiator in Berkshire who values, sells and progresses homes to completion.",
      us: "A real estate agent in Richmond who lists, shows and closes more than 30 homes a year.",
    },
    person: { name: "Natalie Brooks", email: "natalie.brooks@example.com", phone: { uk: "07700 900305", us: "(804) 555-0120" }, location: { uk: "Reading", us: "Richmond, VA" } },
    profile: {
      uk: "Senior sales negotiator with 7 years in residential sales in Berkshire, from first valuation to completion. Agreed 58 sales worth £21 million in 2025 and wins 45% of instructions against rival agents. Cut the share of sales that fall through from 28% to 17% in 2 years. Holds the Propertymark Level 3 Award in Residential Estate Agency and a full UK driving licence.",
      us: "Real estate agent with 7 years in residential sales and leasing in Richmond, from first showing to closing. Closed 34 transactions worth $14 million in 2025 and wins 45% of listings against other agents. Listings sell at 99% of list price in an average of 21 days. Holds a Virginia real estate salesperson license.",
    },
    experience: [
      {
        title: { uk: "Senior Sales Negotiator", us: "Real Estate Agent" },
        org: { uk: "Ashcombe Residential", us: "Ashcombe Realty" },
        location: { uk: "Reading", us: "Richmond, VA" },
        start: "2022-01",
        current: true,
        bullets: [
          {
            uk: "Agreed 58 sales worth £21 million in 2025 by negotiating offers between buyers and sellers, the most of 4 negotiators in the branch",
            us: "Closed 34 transactions worth $14 million in 2025 as listing and buyer's agent, negotiating offers and repairs for each client",
          },
          {
            uk: "Book and carry out around 12 valuations a month, winning 45% of instructions against 3 to 4 rival agents",
            us: "Run around 5 listing appointments a month, winning 45% of listings against 3 to 4 other agents",
          },
          {
            uk: "Set asking prices from comparable sales, with homes selling at 98% of asking price on average in 2025",
            us: "Price homes with a comparative market analysis (CMA), with listings selling at 99% of list price in an average of 21 days",
          },
          {
            uk: "Conduct around 25 viewings a week, sending feedback to sellers within 24 hours",
            us: "Show around 25 homes a week to buyer clients, sending each a written summary within 24 hours",
          },
          {
            uk: "Run sales progression from offer to completion with solicitors and lenders, cutting the share of sales that fall through from 28% to 17% in 2 years",
            us: "Guide buyers and sellers from contract to closing with lenders, inspectors and settlement attorneys, cutting the share of contracts that fall through from 12% to 7% in 2 years",
          },
          {
            uk: "Check identity and source of funds for every buyer and seller under anti-money laundering (AML) rules, with no findings in 2 audits",
            us: "Hold 3 open houses a month, meeting around 40 buyers each month and turning 6 into clients in 2025",
          },
        ],
      },
      {
        title: { uk: "Sales Negotiator", us: "Leasing Consultant" },
        org: { uk: "Penfold Estates", us: "Penfold Residential" },
        location: { uk: "Wokingham", us: "Richmond, VA" },
        start: "2019-06",
        end: "2021-12",
        bullets: [
          {
            uk: "Booked around 60 viewings a week from calls and portal enquiries for a busy town-centre branch",
            us: "Showed around 30 apartments a week at a 320-unit community, signing 18 new leases a month",
          },
          {
            uk: "Agreed 32 sales in 2021 against a target of 25",
            us: "Kept occupancy at 96% over 2 years, against a market average of 93%",
          },
          {
            uk: "Registered around 40 new buyers a month, matching each to homes in their budget",
            us: "Screened around 40 applicants a month for credit, income and rental history under fair housing rules",
          },
          {
            uk: "Kept 120 listings up to date on 2 property portals, with new photos and prices added within a day",
            us: "Renewed 62% of expiring leases in 2021, up from 54% the year before",
          },
          {
            uk: "Arranged around 15 appointments a month with the in-house mortgage adviser, 1 in 3 of which led to a mortgage",
            us: "Ran a resident referral program that brought in 22 new leases in 2021, at a cost of $250 a lease",
          },
        ],
      },
      {
        title: { uk: "Customer Service Adviser", us: "Customer Service Representative" },
        org: "Meadowgate Energy",
        location: { uk: "Reading", us: "Richmond, VA" },
        start: "2017-09",
        end: "2019-05",
        bullets: [
          {
            uk: "Answered around 70 calls a day about bills, meter readings and moving home",
            us: "Answered around 70 calls a day about bills, meter readings and moves",
          },
          "Resolved 85% of calls without passing them on, against a target of 75%",
          "Kept customer satisfaction at 92% over 18 months, against a target of 88%",
          "Trained 6 new advisers on the billing system, each taking calls alone within 3 weeks",
        ],
      },
    ],
    volunteering: [
      {
        title: { uk: "Volunteer football coach", us: "Volunteer youth soccer coach" },
        org: { uk: "Woodley Juniors Football Club", us: "West End Youth Soccer League" },
        start: "2020-09",
        current: true,
        bullets: [
          {
            uk: "Coach a team of 16 under-11 players at weekly training and Saturday matches",
            us: "Coach a team of 16 under-11 players at weekly practices and Saturday games in the spring and fall seasons",
          },
          {
            uk: "Raised £3,200 for new kit and goals through 2 sponsored walks",
            us: "Raised $4,000 for new uniforms and goals through 2 fundraising walks",
          },
        ],
      },
    ],
    education: [
      {
        title: { uk: "BA (Hons) Geography", us: "Bachelor of Arts in Communication Studies" },
        org: { uk: "University of Reading", us: "Virginia Commonwealth University" },
        end: "2017",
        grade: { uk: "2:1", us: "GPA 3.4" },
      },
    ],
    certificates: [
      { title: { uk: "Level 3 Award in Residential Estate Agency", us: "Real estate salesperson license" }, org: { uk: "Propertymark Qualifications", us: "Virginia Real Estate Board" }, end: "2021" },
      {
        title: { uk: "Full UK driving licence", us: "Fair housing and ethics continuing education (16 hours)" },
        org: { uk: "Driver and Vehicle Licensing Agency", us: "Virginia Real Estate Board" },
      },
    ],
    skills: [
      { uk: "Valuations", us: "Listing appointments" },
      { uk: "Winning instructions", us: "Comparative market analysis" },
      { uk: "Viewings", us: "Showings" },
      "Negotiating offers",
      { uk: "Sales progression", us: "Closings" },
      { uk: "Comparable sales", us: "Open houses" },
      { uk: "Anti-money laundering checks", us: "Leasing" },
      { uk: "Property portals", us: "Fair housing rules" },
    ],
    names: ["Ashcombe", "Penfold", "Wokingham", "Woodley", "Meadowgate", "Kennet", "Fairmount", "Propertymark"],
    letter: {
      job: {
        title: { uk: "Sales Valuer", us: "Listing Agent" },
        employer: { uk: "Kennet Homes", us: "Fairmount Realty Group" },
        advert: {
          uk: `Sales Valuer
Kennet Homes, Reading

Kennet Homes is an independent estate agent with 3 branches in Berkshire.

The role
You will value homes, win instructions and look after sellers from listing to completion.

What we are looking for
- At least 3 years in residential sales
- A strong record of winning instructions
- Experience progressing sales to completion
- A Propertymark qualification, or willingness to study for one
- A full UK driving licence`,
          us: `Listing Agent
Fairmount Realty Group, Richmond, VA

Fairmount Realty Group is an independent brokerage with 40 agents across central Virginia.

The role
You will win and market listings, price homes and guide sellers from contract to closing.

What we are looking for
- An active Virginia real estate salesperson license
- At least 3 years in residential real estate
- A strong record of winning listings
- Experience guiding transactions to closing`,
        },
      },
      reason: {
        uk: "I want to spend more of my time valuing homes and winning instructions. I also want to work for an independent agent.",
        us: "I want to spend more of my time on listings and pricing homes. I also want to work for an independent brokerage.",
      },
      paragraphs: [
        {
          uk: "I am applying for the role of Sales Valuer at Kennet Homes. I want to spend more of my time valuing homes and winning instructions. I also want to work for an independent agent.",
          us: "I am applying for the role of Listing Agent at Fairmount Realty Group. I want to spend more of my time on listings and pricing homes. I also want to work for an independent brokerage.",
        },
        {
          uk: "At Ashcombe Residential I book and carry out around 12 valuations a month, winning 45% of instructions against 3 to 4 rival agents. I set asking prices from comparable sales, with homes selling at 98% of asking price on average in 2025.",
          us: "At Ashcombe Realty I run around 5 listing appointments a month, winning 45% of listings against 3 to 4 other agents. I price homes with a comparative market analysis (CMA), with listings selling at 99% of list price in an average of 21 days.",
        },
        {
          uk: "Your advert asks for at least 3 years in residential sales. I agreed 58 sales worth £21 million in 2025 by negotiating offers between buyers and sellers, the most of 4 negotiators in the branch. At Penfold Estates I agreed 32 sales in 2021 against a target of 25.",
          us: "Your advert asks for experience guiding transactions to closing. I closed 34 transactions worth $14 million in 2025 as listing and buyer's agent, negotiating offers and repairs for each client. I guide buyers and sellers from contract to closing with lenders, inspectors and settlement attorneys, cutting the share of contracts that fall through from 12% to 7% in 2 years.",
        },
        {
          uk: "Your advert asks for experience progressing sales to completion. I run sales progression from offer to completion with solicitors and lenders, cutting the share of sales that fall through from 28% to 17% in 2 years.",
          us: "I also hold 3 open houses a month, meeting around 40 buyers each month and turning 6 into clients in 2025. At Penfold Residential I showed around 30 apartments a week at a 320-unit community, signing 18 new leases a month.",
        },
        {
          uk: "I also check identity and source of funds for every buyer and seller under anti-money laundering (AML) rules, with no findings in 2 audits. I hold the Propertymark Level 3 Award in Residential Estate Agency and a full UK driving licence.",
          us: "Your advert asks for an active Virginia real estate salesperson license. I hold a Virginia real estate salesperson license.",
        },
        CLOSE,
      ],
    },
  },
];
