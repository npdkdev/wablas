const { Client, LocalAuth, MessageMedia, MessageSendOptions} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { welcome} = require('./lib/vars.js');
const {cmdCloseNarahubung} = require("./lib/vars");
const { EditDocx } = require('./lib/functions.js');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

let stateUsers = {}


client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED', qr);
});

client.on('ready', async () => {
    //await client.sendMessage('628158806167@c.us', 'test');
    console.log('Client is ready as ', client.info.phone);
});
client.on('message_create', async msg => {
    if (!msg.fromMe && msg.body === '!reset') {
        delete stateUsers[msg.from]
        return await msg.reply('Telah direset')
    }
    if (msg.fromMe && (msg.body === '!close' || typeof msg.body === 'string' && String(msg.body.toLowerCase()) === cmdCloseNarahubung.toLowerCase())) {
        if (stateUsers[msg.to]) {
            console.log(`deleted ${stateUsers[msg.to].cs}`)
            delete stateUsers[msg.to]
        }
        await msg.delete(true) // Passing `true` attempts to delete the message for everyone.
            .then(response => {
                console.log("Message deleted successfully", response);
            })
            .catch(err => {
                console.error("Failed to delete message", err);
            });
    }
})

client.on('message', async msg => {
    if (stateUsers[msg.from] === undefined) {
        stateUsers[msg.from] = {}
    }
    if (msg.body === '!me') {
        console.log(stateUsers[msg.from])
        return await msg.reply(stateUsers[msg.from])
    }
    if (stateUsers[msg.from].type && stateUsers[msg.from].type === 'suratPengantar') {
        if ((stateUsers[msg.from].subtype === undefined && msg.body === '1') || stateUsers[msg.from].subtype === 'skck') {
            if (stateUsers[msg.from].subtype === undefined) {
                stateUsers[msg.from].subtype = 'skck';
            }
            if (stateUsers[msg.from].step === undefined) {
                stateUsers[msg.from].step = 1;
                return await msg.reply('*Siapa Nama Lengkap Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 1) {
                stateUsers[msg.from].step = 2;
                stateUsers[msg.from].nama = msg.body;
                return await msg.reply('*Apa Jenis kelamin Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 2) {
                stateUsers[msg.from].step = 3;
                stateUsers[msg.from].jenisKelamin = msg.body;
                return await msg.reply('*Dimana Tempat Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 3) {
                stateUsers[msg.from].step = 4;
                stateUsers[msg.from].tempatLahir = msg.body;
                return await msg.reply('*Berapa Tanggal Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 4) {
                stateUsers[msg.from].step = 5;
                stateUsers[msg.from].tanggalLahir = msg.body;
                return await msg.reply('*Apa Warga Negara Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 5) {
                stateUsers[msg.from].step = 6;
                stateUsers[msg.from].wargaNegara = msg.body;
                return await msg.reply('*Apa Agama Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 6) {
                stateUsers[msg.from].step = 7;
                stateUsers[msg.from].agama = msg.body;
                return await msg.reply('*Apa Status Perkawinan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 7) {
                stateUsers[msg.from].step = 8;
                stateUsers[msg.from].status = msg.body;
                return await msg.reply('*Sebutkan Nomor NIK/KTP Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 8) {
                stateUsers[msg.from].step = 9;
                stateUsers[msg.from].nik = msg.body;
                return await msg.reply('*Apa Pekerjaan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 9) {
                stateUsers[msg.from].step = 10;
                stateUsers[msg.from].pekerjaan = msg.body;
                return await msg.reply('*Dimana Alamat Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 10) {
                stateUsers[msg.from].step = 11;
                stateUsers[msg.from].alamat = msg.body;
                return await msg.reply(`*Terima Kasih Sudah Menjawab Pertanyaan Yang Sudah Kami Sediakan.*
                 
Berikut Merupakan Data yang Sudah Anda Isi.
 
Nama: *${stateUsers[msg.from].nama}*
Jenis Kelamin: *${stateUsers[msg.from].jenisKelamin}*
Tempat/Tanggal Lahir: *${stateUsers[msg.from].tempatLahir}/${stateUsers[msg.from].tanggalLahir}*
Warga Negara: *${stateUsers[msg.from].wargaNegara}*
Agama: *${stateUsers[msg.from].agama}*
Status Perkawinan: *${stateUsers[msg.from].status}*
No. KTP/NIK: *${stateUsers[msg.from].nik}*
Pekerjaan: *${stateUsers[msg.from].pekerjaan}*
Alamat: *${stateUsers[msg.from].alamat}*
 
*Apakah Rekapitulasi Tersebut Sudah Sesuai dengan Data Anda yang Sebenarnya dan Sejujurnya? Jika Sudah Benar Anda akan Diberikan Surat yang Berbentuk Dokumen, Sedangkan Jika Belum akan Mengulangi Pertanyaan dari Awal*

*1. Ya, Sudah Benar*
*2. Tidak, Belum Benar*`);
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 11) {
                if (msg.body === '1') {
                    let output = EditDocx('SKCK.docx', msg.from+'-SKCK.docx', {
                        fullName: stateUsers[msg.from].nama,
                        gender: stateUsers[msg.from].jenisKelamin,
                        ttl: stateUsers[msg.from].tempatLahir+'/'+stateUsers[msg.from].tanggalLahir,
                        citizen: stateUsers[msg.from].wargaNegara,
                        religion: stateUsers[msg.from].agama,
                        status: stateUsers[msg.from].status,
                        nik: stateUsers[msg.from].nik,
                        job: stateUsers[msg.from].pekerjaan,
                        address: stateUsers[msg.from].alamat,
                    })
                    let theMedia = MessageMedia.fromFilePath(output);
                    theMedia.filename = "Surat Pengantar Catatan Kepolisian SKCK.docx";
                    delete stateUsers[msg.from];
                    return await msg.reply(`*Silahkan Datang ke Kantor Desa untuk Mendapatkan Tanda Tangan Serta Nomor pada Surat.*

*Dengan Syarat Membawa:*
*1. KTP Asli*
*2. KK Asli*

Terima Kasih`, undefined, {media: theMedia});
                } else if (msg.body === '2') {
                    stateUsers[msg.from].step = 1;
                    return await msg.reply('*Siapa Nama Lengkap Anda?*');
                }
            }
        } else if ((stateUsers[msg.from].subtype === undefined && msg.body === '2') || stateUsers[msg.from].subtype === 'umum') {
            if (stateUsers[msg.from].subtype === undefined) {
                stateUsers[msg.from].subtype = 'umum';
            }
            if (stateUsers[msg.from].step === undefined) {
                stateUsers[msg.from].step = 1;
                return await msg.reply('*Siapa Nama Lengkap Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 1) {
                stateUsers[msg.from].step = 2;
                stateUsers[msg.from].nama = msg.body;
                return await msg.reply('*Dimana Tempat Lahir Anda?*');
            }
            if (stateUsers[msg.from].step === 2) {
                stateUsers[msg.from].step = 3;
                stateUsers[msg.from].tempatLahir = msg.body;
                return await msg.reply('*Berapa Tanggal Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 3) {
                stateUsers[msg.from].step = 4;
                stateUsers[msg.from].tanggalLahir = msg.body;
                return await msg.reply('*Apa Warga Negara Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 4) {
                stateUsers[msg.from].step = 5;
                stateUsers[msg.from].wargaNegara = msg.body;
                return await msg.reply('*Apa Agama Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 5) {
                stateUsers[msg.from].step = 6;
                stateUsers[msg.from].agama = msg.body;
                return await msg.reply('*Apa Pekerjaan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 6) {
                stateUsers[msg.from].step = 7;
                stateUsers[msg.from].pekerjaan = msg.body;
                return await msg.reply('*Dimana Tempat Tinggal Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 7) {
                stateUsers[msg.from].step = 8;
                stateUsers[msg.from].tempatTinggal = msg.body;
                return await msg.reply('*Sebutkan Nomer NIK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 8) {
                stateUsers[msg.from].step = 9;
                stateUsers[msg.from].nik = msg.body;
                return await msg.reply('*Sebutkan Nomer KK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 9) {
                stateUsers[msg.from].step = 10;
                stateUsers[msg.from].kk = msg.body;
                return await msg.reply(`*Terima Kasih Sudah Menjawab Pertanyaan Yang Sudah Kami Sediakan.*
                
Berikut Merupakan Data yang Sudah Anda Isi.
                
Nama Lengkap: *${stateUsers[msg.from].nama}*
Tempat/Tanggal Lahir: *${stateUsers[msg.from].tempatLahir}/${stateUsers[msg.from].tanggalLahir}*
Warga Negara: *${stateUsers[msg.from].wargaNegara}*
Agama: *${stateUsers[msg.from].agama}*
Pekerjaan: *${stateUsers[msg.from].pekerjaan}*
Tempat Tinggal: *${stateUsers[msg.from].tempatTinggal}*
No. NIK: *${stateUsers[msg.from].nik}*
No. KK: *${stateUsers[msg.from].kk}*

*Apakah Rekapitulasi Tersebut Sudah Sesuai dengan Data Anda yang Sebenarnya dan Sejujurnya? Jika Sudah Benar Anda akan Diberikan Surat yang Berbentuk Dokumen, Sedangkan Jika Belum akan Mengulangi Pertanyaan dari Awal*

*1. Ya, Sudah Benar*
*2. Tidak, Belum Benar*`);
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 10) {
                if (msg.body === '1') {
                    let output = EditDocx('SPU.docx', msg.from+'-SPU.docx', {
                        fullName: stateUsers[msg.from].nama,
                        ttl: stateUsers[msg.from].tempatLahir+'/'+stateUsers[msg.from].tanggalLahir,
                        citizen: stateUsers[msg.from].wargaNegara,
                        religion: stateUsers[msg.from].agama,
                        job: stateUsers[msg.from].pekerjaan,
                        residence: stateUsers[msg.from].tempatTinggal,
                        nik: stateUsers[msg.from].nik,
                        kk: stateUsers[msg.from].kk,
                    })
                    let theMedia = MessageMedia.fromFilePath(output);
                    theMedia.filename = "Surat Pengantar Umum.docx";
                    delete stateUsers[msg.from];
                    return await msg.reply(`*Silahkan Datang ke Kantor Desa untuk Mendapatkan Tanda Tangan Serta Nomor pada Surat.*
                    
*Dengan Syarat Membawa:*
*1. KTP Asli*
*2. KK Asli*

Terima Kasih`, undefined, {media: theMedia});
                } else if (msg.body === '2') {
                    stateUsers[msg.from].step = 1;
                    return await msg.reply('*Siapa Nama Lengkap Anda?*');
                }
            }
    } else {
            return await msg.reply('*Maaf layanan belum tersedia*')
        }
    } else if (stateUsers[msg.from].type && stateUsers[msg.from].type === 'suratKeterangan') {
        if ((stateUsers[msg.from].subtype === undefined && msg.body === '1') || stateUsers[msg.from].subtype === 'ketumum') {
            if (stateUsers[msg.from].subtype === undefined) {
                stateUsers[msg.from].subtype = 'ketumum';
            }
            if (stateUsers[msg.from].step === undefined) {
                stateUsers[msg.from].step = 1;
                return await msg.reply('*Siapa Nama Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 1) {
                stateUsers[msg.from].step = 2;
                stateUsers[msg.from].nama = msg.body;
                return await msg.reply('*Dimana Tempat Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 2) {
                stateUsers[msg.from].step = 3;
                stateUsers[msg.from].tempatLahir = msg.body;
                return await msg.reply('*Berapa Tanggal Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 3) {
                stateUsers[msg.from].step = 4;
                stateUsers[msg.from].tanggalLahir = msg.body;
                return await msg.reply('*Apa Warga Negara Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 4) {
                stateUsers[msg.from].step = 5;
                stateUsers[msg.from].wargaNegara = msg.body;
                return await msg.reply('*Apa Agama Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 5) {
                stateUsers[msg.from].step = 6;
                stateUsers[msg.from].agama = msg.body;
                return await msg.reply('*Apa Pekerjaan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 6) {
                stateUsers[msg.from].step = 7;
                stateUsers[msg.from].pekerjaan = msg.body;
                return await msg.reply('*Dimana Tempat Tinggal Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 7) {
                stateUsers[msg.from].step = 8;
                stateUsers[msg.from].tempatTinggal = msg.body;
                return await msg.reply('*Sebutkan Nomer NIK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 8) {
                stateUsers[msg.from].step = 9;
                stateUsers[msg.from].nik = msg.body;
                return await msg.reply('*Sebutkan Nomer KK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 9) {
                stateUsers[msg.from].step = 10;
                stateUsers[msg.from].kk = msg.body;
                return await msg.reply(`*Terima Kasih Sudah Menjawab Pertanyaan Yang Sudah Kami Sediakan.*
                
Berikut Merupakan Data yang Sudah Anda Isi.

Nama: *${stateUsers[msg.from].nama}*
Tempat/Tanggal Lahir: *${stateUsers[msg.from].tempatLahir}/${stateUsers[msg.from].tanggalLahir}*
Warga Negara: *${stateUsers[msg.from].wargaNegara}*
Agama: *${stateUsers[msg.from].agama}*
Pekerjaan: *${stateUsers[msg.from].pekerjaan}*
Tempat Tinggal: *${stateUsers[msg.from].tempatTinggal}*
No. NIK: *${stateUsers[msg.from].nik}*
No. KK: *${stateUsers[msg.from].kk}*

*Apakah Rekapitulasi Tersebut Sudah Sesuai dengan Data Anda yang Sebenarnya dan Sejujurnya? Jika Sudah Benar Anda akan Diberikan Surat yang Berbentuk Dokumen, Sedangkan Jika Belum akan Mengulangi Pertanyaan dari Awal*

*1. Ya, Sudah Benar*
*2. Tidak, Belum Benar*`);
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 10) {
                if (msg.body === '1') {
                    let output = EditDocx('SKUMUM.docx', msg.from+'-SKUMUM.docx', {
                        fullName: stateUsers[msg.from].nama,
                        ttl: stateUsers[msg.from].tempatLahir+'/'+stateUsers[msg.from].tanggalLahir,
                        citizen: stateUsers[msg.from].wargaNegara,
                        religion: stateUsers[msg.from].agama,
                        job: stateUsers[msg.from].pekerjaan,
                        residence: stateUsers[msg.from].tempatTinggal,
                        nik: stateUsers[msg.from].nik,
                        kk: stateUsers[msg.from].kk,
                    })
                    let theMedia = MessageMedia.fromFilePath(output);
                    theMedia.filename = "Surat Keterangan Umum.docx";
                    delete stateUsers[msg.from];
                    return await msg.reply(`*Silahkan Datang ke Kantor Desa untuk Mendapatkan Tanda Tangan Serta Nomor pada Surat.*
                    
*Dengan Syarat Membawa:*
*1. KTP Asli*
*2. KK Asli*

Terima Kasih`, undefined, {media: theMedia});
                } else if (msg.body === '2') {
                    stateUsers[msg.from].step = 1;
                    return await msg.reply('*Siapa Nama Lengkap Anda?*');
                }
            }
        } else if ((stateUsers[msg.from].subtype === undefined && msg.body === '2') || stateUsers[msg.from].subtype === 'ketdtt') {
            if (stateUsers[msg.from].subtype === undefined) {
                stateUsers[msg.from].subtype = 'ketdtt';
            }
            if (stateUsers[msg.from].step === undefined) {
                stateUsers[msg.from].step = 1;
                return await msg.reply('*Siapa Nama Lengkap Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 1) {
                stateUsers[msg.from].step = 2;
                stateUsers[msg.from].nama = msg.body;
                return await msg.reply('*Apa Jenis Kelamin Ada?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 2) {
                stateUsers[msg.from].step = 3;
                stateUsers[msg.from].jenisKelamin = msg.body;
                return await msg.reply('*Siapa Bin/Binti Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 3) {
                stateUsers[msg.from].step = 4;
                stateUsers[msg.from].binBinti = msg.body;
                return await msg.reply('*Dimana Tempat Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 4) {
                stateUsers[msg.from].step = 5;
                stateUsers[msg.from].tempatLahir = msg.body;
                return await msg.reply('*Berapa Tanggal Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 5) {
                stateUsers[msg.from].step = 6;
                stateUsers[msg.from].tanggalLahir = msg.body;
                return await msg.reply('*Apa Agama Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 6) {
                stateUsers[msg.from].step = 7;
                stateUsers[msg.from].agama = msg.body;
                return await msg.reply('*Apa Warga Negara Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 7) {
                stateUsers[msg.from].step = 8;
                stateUsers[msg.from].wargaNegara = msg.body;
                return await msg.reply('*Sebutkan Nomer KTP/NIK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 8) {
                stateUsers[msg.from].step = 9;
                stateUsers[msg.from].nik = msg.body;
                return await msg.reply('*Apa Pekerjaan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 9) {
                stateUsers[msg.from].step = 10;
                stateUsers[msg.from].pekerjaan = msg.body;
                return await msg.reply('*Dimana Alamat Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 10) {
                stateUsers[msg.from].step = 11;
                stateUsers[msg.from].alamat = msg.body;
                return await msg.reply(`*Terima Kasih Sudah Menjawab Pertanyaan Yang Sudah Kami Sediakan.*
                
Berikut Merupakan Data yang Sudah Anda Isi.

Nama Lengkap: *${stateUsers[msg.from].nama}*
Jenis Kelamin: *${stateUsers[msg.from].jenisKelamin}*
Bin/Binti: *${stateUsers[msg.from].binBinti}*
Tempat/Tanggal Lahir: *${stateUsers[msg.from].tempatLahir}/${stateUsers[msg.from].tanggalLahir}*
Agama: *${stateUsers[msg.from].agama}*
Warga Negara: *${stateUsers[msg.from].wargaNegara}*
No. KTP/NIK: *${stateUsers[msg.from].nik}*
Pekerjaan: *${stateUsers[msg.from].pekerjaan}*
Alamat: *${stateUsers[msg.from].alamat}*

*Apakah Rekapitulasi Tersebut Sudah Sesuai dengan Data Anda yang Sebenarnya dan Sejujurnya? Jika Sudah Benar Anda akan Diberikan Surat yang Berbentuk Dokumen, Sedangkan Jika Belum akan Mengulangi Pertanyaan dari Awal*

*1. Ya, Sudah Benar*
*2. Tidak, Belum Benar*`);
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 11) {
                if (msg.body === '1') {
                    let output = EditDocx('SKDTT.docx', msg.from+'-SKDTT.docx', {
                        fullName: stateUsers[msg.from].nama,
                        gender: stateUsers[msg.from].jenisKelamin,
                        binBinti: stateUsers[msg.from].binBinti,
                        ttl: stateUsers[msg.from].tempatLahir+'/'+stateUsers[msg.from].tanggalLahir,
                        religion: stateUsers[msg.from].agama,
                        citizen: stateUsers[msg.from].wargaNegara,
                        nik: stateUsers[msg.from].nik,
                        job: stateUsers[msg.from].pekerjaan,
                        address: stateUsers[msg.from].alamat,
                    })
                    let theMedia = MessageMedia.fromFilePath(output);
                    theMedia.filename = "Surat Keterangan Domisili Tempat Tinggal.docx";
                    delete stateUsers[msg.from];
                    return await msg.reply(`*Silahkan Datang ke Kantor Desa untuk Mendapatkan Tanda Tangan Serta Nomor pada Surat.*
                    
*Dengan Syarat Membawa:*
*1. KTP Asli*
*2. KK Asli*

Terima Kasih`, undefined, {media: theMedia});
                } else if (msg.body === '2') {
                    stateUsers[msg.from].step = 1;
                    return await msg.reply('*Siapa Nama Lengkap Anda?*');
                }
            }
        } else if ((stateUsers[msg.from].subtype === undefined && msg.body === '3') || stateUsers[msg.from].subtype === 'ketsktm') {
            if (stateUsers[msg.from].subtype === undefined) {
                stateUsers[msg.from].subtype = 'ketsktm';
            }
            if (stateUsers[msg.from].step === undefined) {
                stateUsers[msg.from].step = 1;
                return await msg.reply('*Siapa Nama Lengkap Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 1) {
                stateUsers[msg.from].step = 2;
                stateUsers[msg.from].nama = msg.body;
                return await msg.reply('*Apa Jenis Kelamin Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 2) {
                stateUsers[msg.from].step = 3;
                stateUsers[msg.from].jenisKelamin = msg.body;
                return await msg.reply('*Dimana Tempat Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 3) {
                stateUsers[msg.from].step = 4;
                stateUsers[msg.from].tempatLahir = msg.body;
                return await msg.reply('*Berapa Tanggal Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 4) {
                stateUsers[msg.from].step = 5;
                stateUsers[msg.from].tanggalLahir = msg.body;
                return await msg.reply('*Apa Warga Negara Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 5) {
                stateUsers[msg.from].step = 6;
                stateUsers[msg.from].wargaNegara = msg.body;
                return await msg.reply('*Apa Agama Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 6) {
                stateUsers[msg.from].step = 7;
                stateUsers[msg.from].agama = msg.body;
                return await msg.reply('*Sebutkan No. KTP/NIK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 7) {
                stateUsers[msg.from].step = 8;
                stateUsers[msg.from].nik = msg.body;
                return await msg.reply('*Apa Pekerjaan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 8) {
                stateUsers[msg.from].step = 9;
                stateUsers[msg.from].pekerjaan = msg.body;
                return await msg.reply('*Dimana Alamat Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 9) {
                stateUsers[msg.from].step = 10;
                stateUsers[msg.from].alamat = msg.body;
                return await msg.reply(`*Terima Kasih Sudah Menjawab Pertanyaan Yang Sudah Kami Sediakan.
                
Berikut Merupakan Data yang Sudah Anda Isi.

Nama Lengkap: *${stateUsers[msg.from].nama}*
Jenis Kelamin: *${stateUsers[msg.from].jenisKelamin}*
Tempat/Tanggal Lahir: *${stateUsers[msg.from].tempatLahir}/${stateUsers[msg.from].tanggalLahir}*
Warga Negara/Agama: *${stateUsers[msg.from].wargaNegara}/${stateUsers[msg.from].agama}*
No. KTP/NIK: *${stateUsers[msg.from].nik}*
Pekerjaan: *${stateUsers[msg.from].pekerjaan}*
Alamat: *${stateUsers[msg.from].alamat}*

*Apakah Rekapitulasi Tersebut Sudah Sesuai dengan Data Anda yang Sebenarnya dan Sejujurnya? Jika Sudah Benar Anda akan Diberikan Surat yang Berbentuk Dokumen, Sedangkan Jika Belum akan Mengulangi Pertanyaan dari Awal*

*1. Ya, Sudah Benar*
*2. Tidak, Belum Benar*`);
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 10) {
                if (msg.body === '1') {
                    let output = EditDocx('SKTM.docx', msg.from+'-SKTM.docx', {
                        fullName: stateUsers[msg.from].nama,
                        gender: stateUsers[msg.from].jenisKelamin,
                        ttl: stateUsers[msg.from].tempatLahir+'/'+stateUsers[msg.from].tanggalLahir,
                        citizen: stateUsers[msg.from].wargaNegara,
                        religion: stateUsers[msg.from].agama,
                        nik: stateUsers[msg.from].nik,
                        job: stateUsers[msg.from].pekerjaan,
                        address: stateUsers[msg.from].alamat,
                    })
                    let theMedia = MessageMedia.fromFilePath(output);
                    theMedia.filename = "Surat Keterangan Tidak Mampu.docx";
                    delete stateUsers[msg.from];
                    return await msg.reply(`*Silahkan Datang ke Kantor Desa untuk Mendapatkan Tanda Tangan Serta Nomor pada Surat.*
                    
*Dengan Syarat Membawa:*
*1. KTP Asli*
*2. KK Asli*

Terima Kasih`, undefined, {media: theMedia});
                } else if (msg.body === '2') {
                    stateUsers[msg.from].step = 1;
                    return await msg.reply('*Siapa Nama Lengkap Anda?*');
                }
            }
        } else if ((stateUsers[msg.from].subtype === undefined && msg.body ==='4') || stateUsers[msg.from].subtype === 'ketsku') {
            if (stateUsers[msg.from].subtype === undefined) {
                stateUsers[msg.from].subtype = 'ketsku';
            }
            if (stateUsers[msg.from].step === undefined) {
                stateUsers[msg.from].step = 1;
                return await msg.reply('*Siapa Nama Lengkap Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 1) {
                stateUsers[msg.from].step = 2;
                stateUsers[msg.from].nama = msg.body;
                return await msg.reply('*Apa Jenis Kelamin Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 2) {
                stateUsers[msg.from].step = 3;
                stateUsers[msg.from].jenisKelamin = msg.body;
                return await msg.reply('*Dimana Tempat Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 3) {
                stateUsers[msg.from].step = 4;
                stateUsers[msg.from].tempatLahir = msg.body;
                return await msg.reply('*Berapa Tanggal Lahir Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 4) {
                stateUsers[msg.from].step = 5;
                stateUsers[msg.from].tanggalLahir = msg.body;
                return await msg.reply('*Apa Kewarganegaraan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 5) {
                stateUsers[msg.from].step = 6;
                stateUsers[msg.from].wargaNegara = msg.body;
                return await msg.reply('*Sebutkan No. KTP/NIK Anda!*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 6) {
                stateUsers[msg.from].step = 7;
                stateUsers[msg.from].nik = msg.body;
                return await msg.reply('*Apa Pekerjaan Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 7) {
                stateUsers[msg.from].step = 8;
                stateUsers[msg.from].pekerjaan = msg.body;
                return await msg.reply('*Dimana Alamat Anda?*');
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 8) {
                stateUsers[msg.from].step = 9;
                stateUsers[msg.from].alamat = msg.body;
                return await msg.reply(`*Terima Kasih Sudah Menjawab Pertanyaan Yang Sudah Kami Sediakan.*
                
Berikut Merupakan Data yang Sudah Anda Isi.

Nama Lengkap: *${stateUsers[msg.from].nama}*
Jenis Kelamin: *${stateUsers[msg.from].jenisKelamin}*
Tempat/Tanggal Lahir: *${stateUsers[msg.from].tempatLahir}/${stateUsers[msg.from].tanggalLahir}*
Kewarganegaraan: *${stateUsers[msg.from].wargaNegara}*
No. KTP/NIK: *${stateUsers[msg.from].nik}*
Pekerjaan: *${stateUsers[msg.from].pekerjaan}*
Alamat: *${stateUsers[msg.from].alamat}*

*Apakah Rekapitulasi Tersebut Sudah Sesuai dengan Data Anda yang Sebenarnya dan Sejujurnya? Jika Sudah Benar Anda akan Diberikan Surat yang Berbentuk Dokumen, Sedangkan Jika Belum akan Mengulangi Pertanyaan dari Awal*

*1. Ya, Sudah Benar*
*2. Tidak, Belum Benar*`);
            }
            if (stateUsers[msg.from].step && stateUsers[msg.from].step === 9) {
                if (msg.body === '1') {
                    let output = EditDocx('SKUSAHA.docx', msg.from+'-SKUSAHA.docx', {
                        fullName: stateUsers[msg.from].nama,
                        gender: stateUsers[msg.from].jenisKelamin,
                        ttl: stateUsers[msg.from].tempatLahir+'/'+stateUsers[msg.from].tanggalLahir,
                        citizen: stateUsers[msg.from].wargaNegara,
                        nik: stateUsers[msg.from].nik,
                        job: stateUsers[msg.from].pekerjaan,
                        address: stateUsers[msg.from].alamat,
                    })
                    let theMedia = MessageMedia.fromFilePath(output);
                    theMedia.filename = "Surat Keterangan Usaha.docx";
                    delete stateUsers[msg.from];
                    return await msg.reply(`*Silahkan Datang ke Kantor Desa untuk Mendapatkan Tanda Tangan Serta Nomor pada Surat.*

*Dengan Syarat Membawa:*
*1. KTP Asli*
*2. KK Asli*

Terima Kasih`, undefined, {media: theMedia});
                } else if (msg.body === '2') {
                    stateUsers[msg.from].step = 1;
                    return await msg.reply('*Siapa Nama Lengkap Anda?*');
                }
            }
        } else {
            await msg.reply('*Maaf, layanan ini belum tersedia*');
            delete stateUsers[msg.from]
        }
    } else if (stateUsers[msg.from].type && stateUsers[msg.from].type === 'narahubung') {
        if (stateUsers[msg.from].cs === undefined || stateUsers[msg.from].cs === false) {
            stateUsers[msg.from].cs = true
            return await msg.reply('*Terima Kasih. Silahkan Tunggu Sebentar dan Anda Akan Tersambung dengan Admin Layanan Desa Saradan*');
        }
    } else if (stateUsers[msg.from].type && stateUsers[msg.from].type === 'start') {
        if (msg.body === '1') {
            stateUsers[msg.from].type = 'suratPengantar'
            return await msg.reply(`*Surat Pengantar Apa yang Anda Butuhkan?*
            
*1. Surat Pengantar untuk Keperluan SKCK*
*2. Surat Pengantar Umum*`);
        } else if (msg.body === '2') {
            stateUsers[msg.from].type = 'suratKeterangan'
            return await msg.reply(`*Surat Keterangan Apa yang Anda Butuhkan?*
            
*1. Surat Keterangan Umum*
*2. Surat Keterangan Domisili Tempat Tinggal*
*3. Surat Keterangan Tidak Mampu (SKTM)*
*4. Surat Keterangan Usaha (SKU)*`)
        } else if (msg.body === '3') {
            stateUsers[msg.from].type = 'narahubung'
            stateUsers[msg.from].type = 'narahubung'
            return await msg.reply('*Apakah Ada yang Bisa Kami Bantu?*')
        }
    } else {
        stateUsers[msg.from].type = 'start'
        await msg.reply(welcome);
    }
});

client.initialize();