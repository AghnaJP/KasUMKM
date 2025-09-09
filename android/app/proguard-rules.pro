# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

########################################
# React Native Core
########################################
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

########################################
# Hermes (kalau dipakai)
########################################
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

########################################
# OkHttp (Networking - dipakai internal RN)
########################################
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

########################################
# AndroidX
########################################
-keep class androidx.** { *; }
-dontwarn androidx.**

########################################
# Gson / JSON (jaga-jaga kalau parsing)
########################################
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

########################################
# SQLite
########################################
-keep class org.sqlite.** { *; }
-dontwarn org.sqlite.**
-keep class net.sqlcipher.** { *; }
-dontwarn net.sqlcipher.**

########################################
# Async Storage (@react-native-async-storage/async-storage)
########################################
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

########################################
# Notifee (@notifee/react-native)
########################################
-keep class app.notifee.** { *; }
-dontwarn app.notifee.**
-keep class io.invertase.notifee.** { *; }
-dontwarn io.invertase.notifee.**

########################################
# General safe defaults
########################################
-keep class * extends java.util.ListResourceBundle {
    protected Object[][] getContents();
}
-keep public class * extends android.app.Application
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class com.facebook.jni.** { *; }
