# Quick Start - Web Platform

## Running Bhojana Yojana on Web

### 1. Start Development Server

```bash
npm start
```

### 2. Open in Browser

Visit: **http://localhost:8081**

The app will automatically:
- ✅ Initialize localStorage-based database
- ✅ Create all required tables
- ✅ Seed sample data (3 pantry items, 2 recipes)
- ✅ Ready to use!

### 3. Verify Data Persistence

1. **Add a pantry item** (navigate to Pantry tab)
2. **Refresh the browser** (F5 or Ctrl+R)
3. **Data should persist** ✨

### Features Available on Web

| Feature | Status | Notes |
|---------|--------|-------|
| Pantry Management | ✅ Working | Add, edit, delete items |
| Recipe Browser | ✅ Working | View recipes with nutrition |
| Grocery Lists | ✅ Working | Create shopping lists |
| Meal Planning | ✅ Working | Plan weekly meals |
| Nutrition Tracking | ✅ Working | Track daily nutrition |
| Data Persistence | ✅ Working | localStorage-based |
| Offline Support | ✅ Working | No internet needed |
| Multilingual | ✅ Working | EN, KN, MR support |

### Web-Specific Notifications

The app displays a banner on Web:
```
🔔 Notifications (Web)
Native notifications not supported on Web. Prep tasks remain visible. 
Use Android app for reminders.
```

This is expected behavior - browser push notifications require service workers which are not implemented in V1.

### Storage Information

**Location**: Browser localStorage  
**Capacity**: ~5-10 MB (sufficient for household data)  
**Persistence**: Permanent (until manually cleared)  

### Clear All Data

Open browser console (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

### Check Storage Usage

```javascript
// Get all database keys
Object.keys(localStorage)
  .filter(key => key.startsWith('db_'))
  .forEach(key => {
    const data = localStorage.getItem(key);
    console.log(key, data.length, 'bytes');
  });

// Calculate total usage
const totalBytes = Object.keys(localStorage)
  .filter(key => key.startsWith('db_'))
  .reduce((sum, key) => sum + localStorage.getItem(key).length, 0);

console.log('Total storage:', (totalBytes / 1024).toFixed(2), 'KB');
```

### Sample Data (Web)

The Web platform includes minimal seed data:

#### Pantry Items (3)
1. **Rice** - 5 kg (Min: 1 kg)
2. **Toor Dal** - 2 kg (Min: 0.5 kg)
3. **Ghee** - 0.5 kg (Min: 0.2 kg)

#### Recipes (2)
1. **Steamed Rice** - 25 min, 180 cal, 4 servings
2. **Dal Tadka** - 40 min, 250 cal, 4 servings

#### Default Nutrition Target
- Calories: 2000 kcal
- Protein: 50g
- Carbs: 250g
- Fat: 70g
- Fiber: 25g

### Common Issues

#### 1. Data Not Saving

**Problem**: Changes disappear after refresh  
**Solution**: Check browser privacy settings - ensure localStorage is enabled

#### 2. Blank Page

**Problem**: White screen on load  
**Solution**: 
- Check browser console (F12) for errors
- Clear localStorage and reload
- Try incognito mode

#### 3. "Storage Quota Exceeded"

**Problem**: Can't add more data  
**Solution**:
```javascript
// Clear old data
localStorage.clear();
location.reload();
```

### Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 4+ | ✅ Tested |
| Firefox | 3.5+ | ✅ Compatible |
| Safari | 4+ | ✅ Compatible |
| Edge | All | ✅ Compatible |
| Mobile | All | ✅ Compatible |

### Development vs Production

**Development** (npm start):
- Hot reload enabled
- Debug console visible
- Metro bundler running
- Access: http://localhost:8081

**Production** (after build):
- Optimized bundle
- No debug overhead
- Can be deployed to static hosting
- Use: `npx expo export:web`

### Next Steps

1. **Explore the App**: Navigate through all 6 tabs
2. **Add Your Data**: Create pantry items and recipes
3. **Test Persistence**: Refresh and verify data remains
4. **Check Documentation**: See [WEB_PERSISTENCE.md](WEB_PERSISTENCE.md) for details

### Need Help?

- 📖 [Web Persistence Documentation](WEB_PERSISTENCE.md)
- 📖 [Main README](../README.md)
- 🐛 Check browser console for error messages
- 💾 Verify localStorage is enabled in browser settings

---

**Enjoy using Bhojana Yojana on the Web! 🍛**
