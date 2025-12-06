module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ Bot hazır! ${client.user.tag} olarak giriş yapıldı.`);
        
        // Status rotation
        const statuses = [
            { name: "Başvurular kontrol ediliyor...", type: 3 }, // Watching
            { name: "Tanrı Türk'ü korusun", type: 0 }, // Playing
            { name: "Başvuruları alıyorum ✅", type: 0 }, // Playing
            { name: `${client.guilds.cache.size} sunucuda hizmet veriyorum 🌍`, type: 5 }, // Competing
            { name: `${client.users.cache.size} kullanıcıya yardımcı oluyorum 🤝`, type: 3 } // Watching
        ];
        
        let currentStatus = 0;
        
        const updateStatus = () => {
            client.user.setActivity(statuses[currentStatus].name, { type: statuses[currentStatus].type });
            currentStatus = (currentStatus + 1) % statuses.length;
        };
        
        // Set initial status
        updateStatus();
        
        // Update status every 30 seconds
        setInterval(updateStatus, 30000);
    }
}