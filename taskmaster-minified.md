# Taskmaster Minified: Quota Management Fast-Track

## Database (1-2 days)
1. ✓ Add to `user_profiles`: `scans_remaining` integer, `total_scans_purchased` integer
2. ✓ Create `scan_quota_transactions` table for audit trail
3. ✓ Create DB functions:
   - `add_scan_quota(user_id, amount, type, reference)` → adds quota
   - `use_scan_quota(user_id)` → deducts 1 scan with validation

## Backend (2-3 days)
1. ✓ Implement PayU webhook to credit scans on payment
2. ✓ Create API endpoints:
   - `GET /quota` → returns current user quota
   - `POST /quota/use` → uses 1 scan
   - `POST /quota/add` → adds scans (admin/coupon)

## Frontend (3-4 days)
1. ✓ Extend `useAuth()` context:
   ```ts
   // In hooks/useAuth.tsx
   const [scansRemaining, setScansRemaining] = useState(0);
   const [optimisticScans, setOptimisticScans] = useState(null);
   
   const refreshScansRemaining = async () => {
     // Fetch from API and update context
   };
   
   // Make available: scansRemaining, refreshScansRemaining
   ```

2. ✓ Add to scan workflow:
   ```ts
   // In scan component
   const { scansRemaining, refreshScansRemaining } = useAuth();
   
   const handleScan = async () => {
     if (scansRemaining <= 0) {
       Alert.alert("No scans remaining", "Purchase more scans to continue");
       navigation.navigate("Subscription");
       return;
     }
     
     // Set optimistic update
     setOptimisticScans(prev => prev !== null ? prev - 1 : scansRemaining - 1);
     
     try {
       // Process scan
       await supabase.rpc('use_scan_quota');
       refreshScansRemaining(); // Update global context
     } catch (error) {
       console.error(error);
       Alert.alert("Error", "Failed to process scan");
     }
   };
   ```

3. ✓ Create quota badge component:
   ```tsx
   // In components/QuotaBadge.tsx
   export const QuotaBadge = () => {
     const { scansRemaining, optimisticScans } = useAuth();
     const displayScans = optimisticScans !== null ? optimisticScans : scansRemaining;
     
     return (
       <View style={styles.badge}>
         <Text style={styles.text}>Scans: {displayScans}</Text>
       </View>
     );
   };
   ```

4. ✓ Add quota UI to all screens:
   - Add QuotaBadge to HomeScreen, ScanScreen, ProfileScreen
   - Add subscription CTA when quota is 0

## Testing (1-2 days)
1. ✓ Test scan validation with 0 quota
2. ✓ Test payment → quota update flow
3. ✓ Test optimistic UI updates

## Deployment (1 day)
1. ✓ Create DB migration
2. ✓ Deploy Edge Functions
3. ✓ Tag and deploy mobile app update

## Critical Items
- ✓ Always use global context for quota
- ✓ Refresh quota after any update
- ✓ Block scans at 0 quota
- ✓ Handle API errors consistently 