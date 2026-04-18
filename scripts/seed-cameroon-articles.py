#!/usr/bin/env python3
"""Seed Cameroon-focused entertainment articles."""

import json, http.client, sys, os

BASE_HOST = "localhost"
BASE_PORT = 3000
API_KEY   = "camer360_auto_42756d753611bdfb3c08ab2714cae872"
import os
_token_paths = [
    r"C:\Users\loneb\AppData\Local\Temp\admin_token.txt",
    "/tmp/camer360_admin_token.txt",
]
COOKIE_VAL = ""
for _p in _token_paths:
    if os.path.exists(_p):
        COOKIE_VAL = "admin_token=" + open(_p).read().strip()
        break
if not COOKIE_VAL:
    raise RuntimeError("No admin token found. Run login curl first.")

ARTICLES = [
    {
        "category_slug": "celebrities",
        "title": "Samuel Eto'o's Foundation Transforms Hundreds of Lives Across Cameroon",
        "excerpt": "The former Barcelona and Inter Milan striker's charitable work is changing communities from Yaoundé to the Adamawa region, funding schools and sports academies for underprivileged youth.",
        "body": """<p>Samuel Eto'o, widely regarded as Africa's greatest footballer of all time, continues to leave a profound mark on Cameroon not just through his legendary playing career but through sustained philanthropic action.</p>

<p>The Samuel Eto'o Foundation has this year expanded its reach into northern Cameroon, funding two new primary schools in the Adamawa region and a state-of-the-art football academy in Douala that has already enrolled over 300 children.</p>

<p>"Football gave me everything," Eto'o told reporters at the Douala inauguration. "Now it's my responsibility to give back to the next generation — not just in Cameroon but across the whole continent."</p>

<p>As President of the Cameroon Football Federation (FECAFOOT), Eto'o has also pushed through sweeping reforms to youth development infrastructure, ensuring grassroots talent is identified and nurtured rather than lost to the streets.</p>

<p>The foundation's health arm has provided free medical checkups to over 15,000 people in rural areas this year alone, covering everything from malaria screening to maternal health programs.</p>

<p>Cameroonians across the diaspora — from Paris to Houston — have rallied behind the initiative, with the foundation raising a record €2.1 million at its annual gala in Paris last month.</p>"""
    },
    {
        "category_slug": "celebrities",
        "title": "André Onana: From Yaoundé's Streets to the Premier League's Best Goalkeeper",
        "excerpt": "The Cameroon and Manchester United number one reflects on his journey from a childhood in Yaoundé to becoming one of the world's most commanding goalkeepers.",
        "body": """<p>André Onana's story is one of extraordinary determination. Born in Nkol Ngok, a working-class neighbourhood of Yaoundé, the goalkeeper left Cameroon at just 13 to join the famed Ajax Amsterdam academy — a leap of faith that would reshape his destiny.</p>

<p>Today, at Manchester United, Onana commands one of football's most pressure-laden positions with a composure that belies his relatively young age. His shot-stopping statistics place him among the top five goalkeepers in Europe this season.</p>

<p>"I always believed I could reach the top," Onana said in an exclusive interview. "Growing up in Yaoundé, you fight every day. That fighting spirit never leaves you — it becomes your greatest weapon."</p>

<p>The keeper's influence extends far beyond the pitch. He has become a powerful symbol for Cameroonian youth, proof that talent nurtured in Central Africa can compete at football's highest level.</p>

<p>His social media following in Cameroon has surged to over 4 million, making him one of the country's most-followed athletes. His return visits to Yaoundé are met with scenes reminiscent of a head of state's homecoming.</p>

<p>Onana is also the face of a new FECAFOOT initiative bringing professional coaching clinics to schools across Cameroon's ten regions — a programme he personally co-funds with Samuel Eto'o's foundation.</p>"""
    },
    {
        "category_slug": "music",
        "title": "Charlotte Dipanda's New Album Cements Her Status as Africa's Queen of Soul",
        "excerpt": "The Cameroonian legend's latest release blends traditional bikutsi rhythms with contemporary Afrobeats production, earning rave reviews from Lagos to London.",
        "body": """<p>Charlotte Dipanda has never needed validation from outside Cameroon to know her worth — but the global reception to her latest album, <em>Mbamba</em>, confirms what her loyal fanbase has always known: she is one of the most gifted vocalists Africa has ever produced.</p>

<p>The Douala-born singer's new record, released across all major streaming platforms this quarter, is already her highest-charting work internationally, debuting at number three on the Apple Music Afrobeats chart and number one across all major Cameroonian streaming platforms.</p>

<p>"<em>Mbamba</em> is my most personal work," Dipanda told us from her Douala recording studio. "Every song is a conversation — with my mother, with Cameroon, with the diaspora scattered around the world missing home."</p>

<p>The album's lead single, "Etoile de Douala," featuring Cameroonian afrobeats producer Askia, has amassed over 12 million streams in its first three weeks — a record for a Cameroonian artist.</p>

<p>Critics have praised Dipanda's vocal range, comparing her to the late Miriam Makeba in terms of emotional depth and cultural rootedness. Her lyrics, primarily in Bassa and French with touches of Pidgin English, celebrate everyday Cameroonian life with a tenderness that transcends language barriers.</p>

<p>A sold-out European tour begins next month, with stops in Paris, Brussels, London, and Berlin — cities with significant Cameroonian diaspora communities who have been waiting years for Dipanda to return to the stage.</p>"""
    },
    {
        "category_slug": "music",
        "title": "Magasco Drops Surprise Collaboration with Afrobeats Superstar — And It's Fire",
        "excerpt": "The Bafoussam-born hitmaker's unexpected link-up with a West African heavyweight has set social media alight and given Cameroonian music its biggest crossover moment in years.",
        "body": """<p>Nobody saw this coming. Magasco, the Cameroonian Afropop king known for hits like "Choko" and "Cameroon," has dropped a surprise collaborative EP that is already being dubbed the crossover moment Cameroonian pop music has been waiting for.</p>

<p>The four-track project, recorded in both Douala and Lagos, showcases Magasco's effortless ability to blend his signature Cameroonian sound — infused with makossa and bikutsi undertones — with the harder-hitting Afrobeats production style that currently dominates African music globally.</p>

<p>"I've always wanted to show the world that Cameroon's music has something unique to offer," Magasco said. "We're not trying to copy Lagos. We're adding our flavour to the conversation."</p>

<p>The EP's lead track has already been picked up by major playlist curators at Spotify and Apple Music, marking what music industry insiders are calling a "watershed moment" for Cameroonian popular music's international reach.</p>

<p>Fans in Douala, Yaoundé, and Bamenda have flooded social media with celebratory posts, while Cameroonian communities in Paris, Atlanta, and Houston have been streaming the tracks on repeat.</p>

<p>An accompanying music video, shot across locations in both Cameroon and Lagos, is set to premiere on YouTube within the week.</p>"""
    },
    {
        "category_slug": "sport-stars",
        "title": "The Indomitable Lions' Youth Revolution: Meet Cameroon's Next Generation of Stars",
        "excerpt": "A new wave of talented young Cameroonians is emerging through the football academies, threatening to make the Indomitable Lions one of Africa's most exciting national teams within five years.",
        "body": """<p>Under the stewardship of Samuel Eto'o at FECAFOOT and a renewed investment in youth infrastructure, Cameroon's footballing conveyor belt is producing talent at a rate not seen since the golden generation of the early 2000s.</p>

<p>Three players in particular have caught the eye of European scouts this season. Yanick Feutchine, a 19-year-old left winger from the Eto'o Academy in Douala, has attracted interest from clubs in the Bundesliga after a stunning season in Cameroon's elite league. His dribbling stats rank him among the top wingers on the continent in the under-21 category.</p>

<p>Meanwhile, central midfielder Blaise Ngum, 20, from Bamenda, is already training with Cameroon's senior squad despite never having played a competitive international. His vision and pressing intensity have drawn comparisons to a young Michael Essien.</p>

<p>In goal, 18-year-old Hermine Nkengue from Yaoundé is making waves in women's football — already capped six times for the senior Indomitable Lionesses and generating interest from clubs in France's Division 1 Féminine.</p>

<p>"We are building something special," FECAFOOT's technical director told Camer360. "In five years, the world will know what Cameroonian football is truly capable of."</p>

<p>The national under-20 side recently reached the final of the Africa U-20 Cup of Nations, finishing as runners-up in a tournament widely praised for the quality of play on display from the young Indomitable Lions.</p>"""
    },
    {
        "category_slug": "gossip",
        "title": "Inside the Star-Studded Douala Celebrity Gala That Everyone Is Talking About",
        "excerpt": "Cameroon's biggest celebrities, businesspeople, and social media personalities gathered for the most glamorous event Douala has seen this year — and the drama did not disappoint.",
        "body": """<p>The Grand Hotel du Littoral in Douala was the setting for what many are already calling the social event of the year in Cameroon. The annual Stars of Cameroon Gala brought together the country's entertainment elite for a night that had everything: red carpet fashion, surprise performances, and more than a few eyebrow-raising moments.</p>

<p>Charlotte Dipanda's arrival in a custom Cameroonian designer gown — hand-beaded with traditional Bamileke patterns — stopped the room. Social media lit up immediately, with fashion commentators praising the choice as a powerful statement of pride in Cameroonian craftsmanship.</p>

<p>Magasco performed a medley of his biggest hits, bringing the audience to its feet before the evening's awards ceremony got underway. The Artiste of the Year award went to Charlotte Dipanda — her third consecutive year claiming the honour.</p>

<p>But it was the after-party that generated the most whispers. Sources tell Camer360 that two prominent Cameroonian socialites were involved in a heated exchange near the bar, apparently over a business deal gone sour. Details remain scarce, but we're told the situation required the intervention of mutual friends before being resolved amicably.</p>

<p>Also spotted causing a stir: a very public display of affection between a well-known Cameroonian TV presenter and a star athlete whose relationship had previously been denied by both parties' representatives. We'll say nothing more — for now.</p>

<p>Douala has spoken. The gala was the event of the season, and Camer360 was there for every moment.</p>"""
    },
    {
        "category_slug": "diaspora",
        "title": "The Cameroonian Diaspora in Atlanta: Building Wealth, Community, and a Bridge Home",
        "excerpt": "Atlanta's thriving Cameroonian community is one of the largest in North America, and its members are using their success to invest back into the homeland in ways that are transforming lives.",
        "body": """<p>Drive through certain neighbourhoods of Atlanta's DeKalb County on a weekend and you might briefly feel transported to Yaoundé. The sounds of makossa drift from community centres, the smell of ndolé and eru from restaurants whose owners made the journey from Douala or Bamenda years ago.</p>

<p>The Cameroonian community in Atlanta numbers an estimated 25,000 people, making it one of the most significant concentrations of Cameroonians in the Americas. And unlike some diaspora communities defined primarily by nostalgia, Atlanta's Cameroonians are increasingly defined by action — specifically, the business of building bridges between their adopted city and their homeland.</p>

<p>"We don't just talk about Cameroon at parties," says Dr. Bertrand Mbah, founder of the Cameroon-Georgia Business Council. "We invest. We build. We create pathways for people back home."</p>

<p>The Council has facilitated over $4.2 million in remittances and direct business investment into Cameroon in the past year alone — funding everything from a tech startup incubator in Yaoundé to a cassava processing facility in the Southwest region.</p>

<p>The community has also produced remarkable professional success stories. Three Cameroonian-origin physicians lead departments at Atlanta's Emory University Hospital. A Cameroonian-founded tech company recently raised Series A funding of $12 million. And the community's youth sports teams have won multiple Georgia state championships.</p>

<p>The annual Atlanta Cameroon Cultural Festival, held each summer, draws thousands of attendees from across the southeastern United States — a celebration of music, food, fashion, and the fierce pride that defines the Cameroonian diaspora experience.</p>"""
    },
    {
        "category_slug": "fashion-beauty",
        "title": "Cameroonian Designers Are Redefining African Fashion on the Global Stage",
        "excerpt": "A new generation of Cameroonian fashion designers is gaining international recognition, blending traditional Cameroonian textiles with contemporary silhouettes that are turning heads in Paris and New York.",
        "body": """<p>The global fashion world is waking up to something Cameroonians have always known: their country's textile traditions, from the intricate ndop cloth of the Bamileke people to the vibrant wax prints favoured in Douala's markets, are among Africa's richest and most distinctive.</p>

<p>At the forefront of this renaissance is Douala-based designer Adaeze Nkemdirim, whose label Ndop House has just announced a capsule collection partnership with a major Paris retailer — a first for a Cameroonian fashion house.</p>

<p>"The world is finally ready to see African fashion not as costume or curiosity but as genuine high fashion," Nkemdirim told Camer360 from her Douala atelier. "And Cameroon has so much to offer — the craftsmanship here is extraordinary."</p>

<p>Her collection, which premiered at Dakar Fashion Week to standing ovations, reimagines traditional Cameroonian royal attire through a contemporary lens: structured blazers in royal blue ndop cloth, flowing maxi dresses in hand-printed wax cotton, accessories featuring hand-carved Cameroonian mahogany.</p>

<p>Also making waves internationally is Yaoundé-born menswear designer Brice Fouda, whose tailored suits incorporating Cameroonian kente-style weaving have been worn by several high-profile Cameroonian celebrities at international events.</p>

<p>Both designers speak of a deliberate mission: to ensure Cameroon's fashion story is told by Cameroonians, on Cameroonian terms — with the craftsmanship, cultural knowledge, and creative vision staying rooted in the homeland even as the finished products travel the world.</p>"""
    },
    {
        "category_slug": "influencers",
        "title": "Cameroon's Social Media Stars: The Creators Putting Douala and Yaoundé on the Global Map",
        "excerpt": "A new generation of Cameroonian content creators is amassing millions of followers and reshaping how the world sees Central Africa — one viral video at a time.",
        "body": """<p>Meet the generation that is changing Cameroon's image online: young, creative, digitally native Cameroonians who are building audiences of millions through wit, authenticity, and an unashamed celebration of everything that makes their country unique.</p>

<p>At the head of this movement is Douala-based lifestyle creator Fatoumata Bello, whose Instagram and TikTok accounts documenting life in Cameroon's commercial capital have amassed a combined following of 3.8 million. Her series "Douala Chronicles" — candid, humorous, and deeply affectionate portraits of everyday Douala life — has been featured in international media from the BBC to Le Monde.</p>

<p>"I wanted to show a different Cameroon," Bello explains. "Not the Cameroon of news headlines, but the Cameroon of jollof rice debates, of Lôh-Djiboua music blasting from motos, of families laughing over ndolé on Sunday afternoons."</p>

<p>Food creator Carine Ngouté from Yaoundé has built a loyal following of 1.2 million with her recipes showcasing Cameroonian cuisine — from eru and waterleaf to kati-kati grilled chicken — elevating traditional dishes with production values that rival major international food channels.</p>

<p>Comedy creator Alain Fogue's skit channel, which riffs on Cameroonian office culture, traffic in Yaoundé, and the eternal north-south cultural divides within Cameroon, has generated several videos topping 10 million views — remarkable numbers for a creator working outside of Lagos or Accra.</p>

<p>Brand deals are following the audiences. Several major consumer brands — including telecommunications companies and FMCG giants operating in Central Africa — have begun significant influencer marketing campaigns with Cameroonian creators, signalling a maturing of the market.</p>"""
    },
    {
        "category_slug": "viral",
        "title": "Cameroonian Footballer's Incredible Bicycle Kick Goes Viral With 40 Million Views",
        "excerpt": "A stunning acrobatic goal scored in Cameroon's Elite One league has set the internet alight, with football fans worldwide sharing the clip and calling it one of the goals of the year.",
        "body": """<p>It lasted less than two seconds — the moment a young Cameroonian striker launched himself into the air, twisted his body, and connected with a bicycle kick so perfectly executed that even the opposing goalkeeper applauded as the ball hit the net.</p>

<p>The goal, scored by 22-year-old Fils-Dieu Mvondo playing for a Yaoundé club in the Elite One championship, was captured by a pitch-side camera and posted to social media by a local sports journalist. Within 48 hours, it had been shared by football accounts with tens of millions of followers worldwide.</p>

<p>The clip currently sits at over 40 million views across TikTok and Twitter combined — making it one of the most-watched moments in Cameroonian football history, and thrusting the previously little-known Mvondo into the international spotlight.</p>

<p>European scout enquiries have already arrived at the player's club, with sources confirming interest from clubs in Belgium, Turkey, and France. The player's agent confirmed that formal discussions are underway with at least three European sides.</p>

<p>"I was just trying to keep the ball in play," a visibly overwhelmed Mvondo told reporters after the game. "I didn't even realise how it looked until I saw the video later."</p>

<p>Cameroonians across social media have erupted with pride, with the hashtag #MVondo40M trending nationally for three consecutive days. Samuel Eto'o himself posted the clip on his Instagram with the caption: "The future is Cameroonian."</p>"""
    },
    {
        "category_slug": "money-moves",
        "title": "Meet the Cameroonian Entrepreneur Turning Douala Into a Tech Investment Hub",
        "excerpt": "With $8 million raised and partnerships from Nairobi to London, this Cameroonian startup founder is proving that Central Africa's tech ecosystem is ready for the world stage.",
        "body": """<p>When Serge Binam returned to Douala from London in 2021 after six years working in fintech, his friends thought he was crazy. Why leave a six-figure salary in one of the world's financial capitals to start a startup in a country whose tech ecosystem barely registered on global investor radar screens?</p>

<p>Three years later, those friends are considerably less sceptical. Binam's company, MoniePay Cameroun, has processed over $50 million in transactions through its mobile payment platform, signed partnerships with two major Cameroonian banks, and just closed an $8 million Series A — the largest single funding round ever raised by a Cameroonian tech company.</p>

<p>"Cameroon was not behind — it was just undiscovered," Binam says from his Bonapriso office, where a team of 45 engineers, designers, and business developers work across three floors of a building that has become something of a pilgrimage site for Douala's emerging startup community.</p>

<p>MoniePay's platform allows users across Cameroon and increasingly across CEMAC (the Central African Economic and Monetary Community) to send, receive, and store money digitally with fees significantly lower than traditional banking alternatives.</p>

<p>The implications for financial inclusion are significant: an estimated 65% of Cameroonians remain unbanked, and mobile money platforms like MoniePay are positioned to leapfrog traditional banking infrastructure just as mobile telephony did for voice communications.</p>

<p>Binam is now in conversations with the government about MoniePay's potential role in digitising public sector payments — a contract that could make the platform the backbone of Cameroon's digital economy transition.</p>"""
    },
]

def create_article(article):
    conn = http.client.HTTPConnection(BASE_HOST, BASE_PORT)
    payload = json.dumps({
        "title": article["title"],
        "category_slug": article["category_slug"],
        "excerpt": article["excerpt"],
        "body": article["body"],
    })
    conn.request("POST", "/api/n8n/articles", payload, {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    })
    resp = conn.getresponse()
    data = json.loads(resp.read())
    conn.close()
    return data

def publish_article(article_id, article):
    conn = http.client.HTTPConnection(BASE_HOST, BASE_PORT)
    payload = json.dumps({
        "status": "published",
        "title": article["title"],
        "excerpt": article["excerpt"],
        "body": article["body"],
        "category_slug": article["category_slug"],
    })
    conn.request("PUT", f"/api/admin/articles/{article_id}", payload, {
        "Content-Type": "application/json",
        "Cookie": COOKIE_VAL,
    })
    resp = conn.getresponse()
    data = json.loads(resp.read())
    conn.close()
    return data

print(f"Seeding {len(ARTICLES)} Cameroon-focused articles...")
print()

successes = 0
for i, article in enumerate(ARTICLES):
    print(f"[{i+1}/{len(ARTICLES)}] Creating: {article['title'][:60]}...")
    create_result = create_article(article)

    if not create_result.get("ok"):
        print(f"  ERROR creating: {create_result}")
        continue

    article_id = create_result["id"]
    pub_result = publish_article(article_id, article)

    if pub_result.get("ok"):
        print(f"  Published (id={article_id})")
        successes += 1
    else:
        print(f"  Created id={article_id} but publish failed: {pub_result}")

print()
print(f"Done: {successes}/{len(ARTICLES)} articles published.")
