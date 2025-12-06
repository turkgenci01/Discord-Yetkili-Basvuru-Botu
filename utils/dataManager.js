const fs = require('fs');
const path = require('path');

class DataManager {
    constructor() {
        this.dataFile = path.join(__dirname, '..', 'data', 'applicationData.json');
        this.data = new Map();
        this.ensureDataDirectory();
        this.loadData();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(this.dataFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    loadData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                const rawData = fs.readFileSync(this.dataFile, 'utf8');
                const jsonData = JSON.parse(rawData);
                
                // Convert object back to Map
                for (const [key, value] of Object.entries(jsonData)) {
                    this.data.set(key, value);
                }
                
                console.log(`📂 ${this.data.size} adet veri yüklendi.`);
            } else {
                console.log('📂 Yeni veri dosyası oluşturulacak.');
            }
        } catch (error) {
            console.error('❌ Veri yükleme hatası:', error);
            this.data = new Map();
        }
    }

    saveData() {
        try {
            // Convert Map to object for JSON
            const jsonData = Object.fromEntries(this.data);
            fs.writeFileSync(this.dataFile, JSON.stringify(jsonData, null, 2));
        } catch (error) {
            console.error('❌ Veri kaydetme hatası:', error);
        }
    }

    set(key, value) {
        this.data.set(key, value);
        this.saveData();
    }

    get(key) {
        return this.data.get(key);
    }

    delete(key) {
        const result = this.data.delete(key);
        this.saveData();
        return result;
    }

    has(key) {
        return this.data.has(key);
    }

    get size() {
        return this.data.size;
    }

    entries() {
        return this.data.entries();
    }

    // Cleanup old data
    cleanup() {
        const now = Date.now();
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        let cleanedApplications = 0;
        let cleanedUserData = 0;
        
        for (const [key, value] of this.data.entries()) {
            if (key.startsWith('application_')) {
                if (value.timestamp && value.timestamp < sevenDaysAgo) {
                    this.data.delete(key);
                    cleanedApplications++;
                }
            } else if (!key.startsWith('guild_')) {
                if (!value || typeof value !== 'object') {
                    this.data.delete(key);
                    cleanedUserData++;
                }
            }
        }
        
        if (cleanedApplications > 0 || cleanedUserData > 0) {
            this.saveData();
        }
        
        return { cleanedApplications, cleanedUserData };
    }
}

module.exports = DataManager;