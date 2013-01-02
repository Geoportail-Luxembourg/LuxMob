The following patch was applied to phonegap-2.2.0/lib/ios/bin/create:

diff --git a/external/phonegap-2.2.0/lib/ios/bin/create b/external/phonegap-2.2.0/lib/ios/bin/create
index 2b8a3d6..e3adc7f 100755
--- a/external/phonegap-2.2.0/lib/ios/bin/create
+++ b/external/phonegap-2.2.0/lib/ios/bin/create
@@ -1,4 +1,4 @@
-#! /bin/sh
+#! /bin/bash

Without this the `create` script fails on Linux.
