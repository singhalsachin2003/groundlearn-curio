// The first screen: a floating island picture, what the app is, and a "Did you know?" fact.
import heroSvg from './hero.svg?raw';

export const HERO = heroSvg.replace(' width="1024" height="1024"', ' role="img" aria-hidden="true"');

/** Short, checked science and maths facts for curious kids. One a day, more on a tap. */
export const FACTS: { en: string; hi: string }[] = [
  { en: 'Light from the Sun takes about 8 minutes to reach Earth.', hi: 'सूरज की रोशनी को धरती तक पहुँचने में लगभग 8 मिनट लगते हैं।' },
  { en: 'An octopus has three hearts.', hi: 'ऑक्टोपस के तीन दिल होते हैं।' },
  { en: 'Ice floats because water grows bigger when it freezes.', hi: 'बर्फ़ तैरती है क्योंकि पानी जमने पर फैल जाता है।' },
  { en: 'A day on Venus is longer than its whole year.', hi: 'शुक्र ग्रह पर एक दिन उसके पूरे साल से भी लंबा होता है।' },
  { en: 'A grown-up has about 206 bones.', hi: 'एक बड़े इंसान के शरीर में लगभग 206 हड्डियाँ होती हैं।' },
  { en: 'Lightning is hotter than the surface of the Sun.', hi: 'बिजली की चमक सूरज की सतह से भी ज़्यादा गर्म होती है।' },
  { en: 'Bananas are berries, but strawberries are not.', hi: 'केला एक बेरी है, पर स्ट्रॉबेरी नहीं।' },
  { en: 'Sound travels about 4 times faster in water than in air.', hi: 'आवाज़ पानी में हवा से लगभग 4 गुना तेज़ चलती है।' },
  { en: 'Bees build six-sided cells because hexagons fit together with no gaps.', hi: 'मधुमक्खियाँ छह कोनों वाले खाने बनाती हैं क्योंकि षट्भुज बिना खाली जगह के आपस में जुड़ जाते हैं।' },
  { en: 'Zero was first used as a number in India.', hi: 'शून्य को एक संख्या की तरह सबसे पहले भारत में इस्तेमाल किया गया।' },
  { en: 'Footprints on the Moon can last for millions of years: there is no wind to blow them away.', hi: 'चाँद पर पैरों के निशान लाखों साल तक रह सकते हैं, क्योंकि वहाँ उन्हें मिटाने वाली हवा नहीं है।' },
  { en: 'Plants make their own food from sunlight, water and air.', hi: 'पौधे धूप, पानी और हवा से अपना खाना ख़ुद बनाते हैं।' },
  { en: 'Red light and blue light together look magenta.', hi: 'लाल और नीली रोशनी मिलकर मैजेंटा (गुलाबी-बैंगनी) दिखती है।' },
  { en: 'Diamonds and pencil "lead" are both made of carbon.', hi: 'हीरा और पेंसिल की "लीड" दोनों कार्बन से बने होते हैं।' },
  { en: 'Saturn is so light for its size that it would float in a giant bathtub.', hi: 'शनि ग्रह अपने आकार के हिसाब से इतना हल्का है कि एक बहुत बड़े टब में तैर जाए।' },
  { en: 'Snowflakes almost always have six arms.', hi: 'बर्फ़ के फाहों की लगभग हमेशा छह भुजाएँ होती हैं।' },
  { en: 'Your heart beats about 100,000 times a day.', hi: 'तुम्हारा दिल एक दिन में लगभग 1,00,000 बार धड़कता है।' },
  { en: 'Salt water freezes at a colder temperature than fresh water.', hi: 'खारा पानी मीठे पानी से ज़्यादा ठंड में जमता है।' },
  { en: 'A cheetah can run at about 100 km per hour.', hi: 'चीता लगभग 100 किलोमीटर प्रति घंटे की रफ़्तार से दौड़ सकता है।' },
  { en: 'Adding up 1 + 2 + 3 + … + 100 gives 5050.', hi: '1 + 2 + 3 + … + 100 का जोड़ 5050 होता है।' },
];

/** Today's fact index, the same for everyone on a given day. */
export const factOfDay = () => Math.floor(Date.now() / 864e5) % FACTS.length;
