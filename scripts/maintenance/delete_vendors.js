const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

dns.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://boxfox:boxfox@cluster0.7oansfw.mongodb.net/";

const emailsToDelete = [
  "melissa@vargco.com",
  "r.ob.h.e.n.ry8.3@gmail.com",
  "benjamin@korper.nl",
  "c.a.r.oline.l.o.rd288@gmail.com",
  "w.uru.h.ua..fi.ona@gmail.com",
  "d.t7.9.sh.o.ve.l@gmail.com",
  "adam.bignell@icloud.com",
  "beverligardner@yahoo.com",
  "n.lo.n.go.83.7@gmail.com",
  "ke.ir.am.c.b.and.y@gmail.com",
  "z.pa.r.ker.4.00@gmail.com",
  "daniel@80si.com",
  "neil.cawley@comcast.net",
  "d.a.v.ide.du.c.h.arme@gmail.com",
  "claude.lewis3@hotmail.com",
  "craigjsam@icloud.com",
  "runderwood@revelunderwood.com",
  "info@acelectricalinc.com",
  "co.rdr.e.y.4.2@gmail.com",
  "vmasssag@hotmail.com",
  "mwhalen3507@comcast.net",
  "allison@unit221b.com",
  "o.hu.w.o.xahem.oh0.3@gmail.com",
  "y.e.we.ji.v.o.ye61@gmail.com",
  "paula_burr@yahoo.com",
  "a.moral.e.s1.61@gmail.com",
  "timo@korper.nl",
  "naftali@korper.nl",
  "security@korper.nl",
  "colleen.symmes@peachstatekitchen.com",
  "randy.korich@ic3.gov",
  "sjors.derksen@korper.nl",
  "small31@korper.nl",
  "tom@korper.nl",
  "notifications@korper.nl",
  "mark.heavener@texasbaptists.org",
  "p0rt0kali@yahoo.com",
  "matt.mccarthy@comcast.net",
  "schuetzgruenwald@posteo.de",
  "w.hang.p.y@gmail.com",
  "ja50nchan@yahoo.com",
  "andiefitz@aol.com",
  "rayn.em.at.ia.s.z@gmail.com",
  "carolineg@lawtonwelding.com",
  "grpriolo@yahoo.com",
  "rupalpatel73@yahoo.com",
  "hennyz@bhsenvironmental.com",
  "e.l.sa.koo@gmail.com",
  "melsl.au.n.dr.yo.a.si.s@gmail.com",
  "leyvacarlos@hotmail.com",
  "akr.id.ge.2.980@gmail.com",
  "suzannepk@comcast.net",
  "je.nn...sote.l.o@gmail.com",
  "l.l.oyd.k.en.sett.1.2.3.4@gmail.com",
  "christianmouzard@videotron.ca",
  "jainsima@hotmail.com",
  "cs.m.it.h.5.966@gmail.com",
  "lewist@lawtonwelding.com",
  "camiel@korper.nl",
  "cr.he.e2.3@gmail.com",
  "n.e.urod.i.gm@gmail.com",
  "m..p.au.l.6.2.9@gmail.com",
  "f.ac.k.t.hi.s.20.20@gmail.com",
  "n.oz.a.r.up.u.ba.s31.9@gmail.com",
  "blackjack6383@yahoo.com",
  "v.ic.ki.e..mil.l.e.r.9.13@gmail.com",
  "sk8.e.r.xe.ra@gmail.com",
  "9046555967@vtext.com",
  "moechristian@yahoo.com",
  "mattfiacco@hotmail.com",
  "royf.ol.ey8.8@gmail.com",
  "g.folso.m.134@gmail.com",
  "gwysong@cox.net",
  "7572778193@tmomail.net",
  "mrothe1264@yahoo.com",
  "lucygateno@yahoo.com",
  "melanie.jones8@yahoo.com",
  "yle.vert.o.v@gmail.com",
  "amandaaddis@live.com",
  "sfryar@comcast.net",
  "7578137759@vtext.com",
  "info@korper.nl",
  "evan24@rochester.rr.com",
  "music@vintvarner.com",
  "tren.t.s.taffo.r.d.12.2.5@gmail.com",
  "lbea.rde.n@gmail.com",
  "dandrisani@hotmail.com",
  "me.aga.nbeekl.e.r@gmail.com",
  "paris@collectivelyinc.com",
  "k.mon.toyay.f7@gmail.com",
  "o.n.uda.l.ix7.9@gmail.com",
  "o.c.eq.ipu.r.u6.31@gmail.com",
  "roydamy@yandex.ru",
  "carolsue_cline@yahoo.com",
  "abelousov@chameleongroup.co",
  "alunev@a7gi.ru",
  "abelousova@a7gi.ru",
  "info@hotelmatina-mykonos.com",
  "b.r.e.we.r.25.0r@gmail.com",
  "j.u.sti.n..j.mcnam.ara@gmail.com",
  "dbaker@ustcorp.net",
  "debbiehead59@yahoo.com",
  "abajramovic17@yahoo.com",
  "on.u.d.a.li.x79@gmail.com",
  "sbeloshapkina@chameleongroup.co",
  "mstepanova@chameleongroup.co",
  "mcshaw67@yahoo.com",
  "7143979411@vtext.com",
  "ca.r.m.e.n.di.ez.mac.ias@gmail.com",
  "h.a.ve.n..e.a.s.o.n@gmail.com",
  "fabrisciarpa@libero.it",
  "aandreeva@a7gi.ru",
  "silyukhova@a7gi.ru",
  "richardavendano@yahoo.com",
  "ebabenko@chameleongroup.co",
  "rweber@kimballne.org",
  "liam.shissler@co.snohomish.wa.us",
  "a1lady55@yahoo.com",
  "sh.e.ah.er.ma.n.n.1.6@gmail.com",
  "c.jones@pgud.org",
  "suresh@suresh.law",
  "2072297507@txt.att.net",
  "info@lakeshoredesignandbuild.com",
  "gminella@bellsouth.net",
  "rgb.as.k.e.tb.a.llg.irl@gmail.com",
  "a.ndy.g.ra.h.a.m.87.59@gmail.com",
  "srebstock@rebstockconveyors.com",
  "justinerskine@cs.com",
  "ec.o.bi.s.a.k3.47@gmail.com",
  "prodionov@chameleongroup.co",
  "w.a.lston.cade@gmail.com",
  "j.hallford@kmmcorp.net",
  "caro.lyn.r.ad.tke.7.4@gmail.com",
  "globugs.i.s@gmail.com",
  "investor-relations@7-11.com.ph",
  "6198669361@txt.att.net",
  "info@fringeseattle.com",
  "marina_lurye@hotmail.com",
  "abonett@adamsre.com",
  "ricese@hotmail.com",
  "amoss@chimphaven.org",
  "assaad.choufani2@outlook.com",
  "burwiller@ag-power.com",
  "relax@clearlight-saunas.com.au",
  "zoulethgonzalez@outlook.com",
  "fu.f.en.g@gmail.com",
  "f.o.r.r.e.ster@gmail.com",
  "reggiesaddler@hotmail.com",
  "irma.hernandez@oncor.com",
  "s.hearx.p.erf.e.c.t.io.n@gmail.com",
  "c.f.b.a.rr.e.ro15@gmail.com",
  "jbudykina@a7gi.ru",
  "celestine.chia@astoncarter.com",
  "ma.rtinez..a.n.d.r.eya.3.25@gmail.com",
  "eileenpotter@comcast.net",
  "fischerwyo@msn.com",
  "a.un.g.sawj.ue@gmail.com",
  "javan.fi.g.uero.a@gmail.com",
  "j.ld..vic.kro.y@gmail.com",
  "xkvpmqbrjs@tuta.com",
  "elizabethlazaryan@yahoo.com",
  "questions@valvesoftware.com",
  "hhull@jor-mac.com"
];

async function deleteVendors() {
    try {
        console.log(`Connecting to MongoDB using URI from .env...`);
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        
        console.log(`Checking match count...`);
        const beforeCount = await db.collection('users').countDocuments({ email: { $in: emailsToDelete } });
        console.log(`Found ${beforeCount} matching users in collection 'users'.`);

        if (beforeCount > 0) {
            console.log(`Deleting matching users...`);
            const result = await db.collection('users').deleteMany({ email: { $in: emailsToDelete } });
            console.log(`Successfully deleted ${result.deletedCount} users.`);
        } else {
            console.log(`No users matched for deletion.`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error running deletion:", err.message);
        process.exit(1);
    }
}

deleteVendors();
