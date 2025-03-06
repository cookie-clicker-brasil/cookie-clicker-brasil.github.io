# General ProGuard Configuration

# Enable optimization to improve performance and reduce APK size
-optimizationpasses 5
# Allow access to obfuscated class members by reflection
-allowaccessmodification
# Merge similar interface implementations to reduce code size
-mergeinterfacesaggressively

# Suppress warnings for specific packages to avoid unnecessary log output
-dontwarn javax.**
-dontwarn org.apache.**
-dontwarn androidx.**
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
-dontwarn okhttp3.**
-dontwarn okio.**

# Preserve Firebase and Google Play Services classes to ensure proper functionality
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Preserve classes used by popular libraries like Glide and Retrofit
-keep class com.bumptech.glide.** { *; }
-keep class retrofit2.** { *; }

# Preserve class members that might be accessed via reflection
-keepclassmembers class * {
    public <fields>;
    public <methods>;
}

# Preserve source file and line number information for better stack traces
-keepattributes SourceFile,LineNumberTable

# Remove debug information to reduce APK size
-renamesourcefileattribute SourceFile
