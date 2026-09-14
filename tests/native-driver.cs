using System;
using System.Runtime.InteropServices;
using System.Threading;
public static class HaloTestDriver {
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(POINT p);
 [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr h,uint flag);
 [DllImport("user32.dll",SetLastError=true)] static extern uint SendInput(uint n,INPUT[] a,int cb);
 [StructLayout(LayoutKind.Sequential)] public struct POINT { public int x,y; }
 [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public U u; }
 [StructLayout(LayoutKind.Explicit)] struct U { [FieldOffset(0)] public K k; [FieldOffset(0)] public M m; }
 [StructLayout(LayoutKind.Sequential)] struct K { public ushort vk,scan;public uint flags,time; public UIntPtr extra; }
 [StructLayout(LayoutKind.Sequential)] struct M { public int x,y;public uint data,flags,time; public UIntPtr extra; }
 static INPUT Key(ushort k,bool up){INPUT a=new INPUT();a.type=1;a.u.k.vk=k;a.u.k.flags=up?2u:0u;return a;}
 static void Send(INPUT[] a){uint n=SendInput((uint)a.Length,a,Marshal.SizeOf(typeof(INPUT)));if(n!=a.Length)throw new Exception("SendInput count="+n+" error="+Marshal.GetLastWin32Error());}
 public static void Summon(long receiver,int hold){if(GetForegroundWindow().ToInt64()!=receiver)throw new Exception("Receiver not foreground: abort hotkey");Send(new INPUT[]{Key(0x11,false),Key(0x12,false),Key(0x51,false)});Thread.Sleep(hold);Send(new INPUT[]{Key(0x51,true),Key(0x12,true),Key(0x11,true)});}
 public static void Escape(long receiver){if(GetForegroundWindow().ToInt64()!=receiver)throw new Exception("Receiver not foreground: abort Escape");Send(new INPUT[]{Key(0x1B,false),Key(0x1B,true)});}
 public delegate bool WindowCallback(IntPtr window,IntPtr data);
 [DllImport("user32.dll")] static extern bool EnumWindows(WindowCallback callback,IntPtr data);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr window);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint pid);
 [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr window);
 [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr window,int cmd);
 [DllImport("user32.dll")] static extern bool BringWindowToTop(IntPtr window);
 [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
 [DllImport("user32.dll")] static extern bool AttachThreadInput(uint from,uint to,bool attach);
 public static void FocusTestProcess(uint pid){IntPtr window=IntPtr.Zero;EnumWindows(delegate(IntPtr h,IntPtr unused){uint p;GetWindowThreadProcessId(h,out p);if(p==pid&&IsWindowVisible(h)){window=h;return false;}return true;},IntPtr.Zero);if(window==IntPtr.Zero)throw new Exception("Test receiver not found");SetForegroundWindow(window);}
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr hwnd,System.Text.StringBuilder text,int max);
 public static string FocusTestTitle(string title){
  if(!title.StartsWith("Halo local input regression "))throw new Exception("Not a test title");
  IntPtr found=IntPtr.Zero;uint foundPid=0;
  EnumWindows(delegate(IntPtr h,IntPtr unused){var name=new System.Text.StringBuilder(256);GetWindowText(h,name,name.Capacity);if((name.ToString()==title||name.ToString()==title+" - Google Chrome")&&IsWindowVisible(h)){found=h;GetWindowThreadProcessId(h,out foundPid);return false;}return true;},IntPtr.Zero);
  if(found==IntPtr.Zero)throw new Exception("Test window not found");
  ShowWindowAsync(found,9); uint targetThread=GetWindowThreadProcessId(found,out foundPid); uint callerThread=GetCurrentThreadId(); bool attached=targetThread!=callerThread&&AttachThreadInput(callerThread,targetThread,true); try { BringWindowToTop(found); SetForegroundWindow(found); } finally { if(attached)AttachThreadInput(callerThread,targetThread,false); }
  return "{\"hwnd\":\""+found.ToInt64()+"\",\"pid\":"+foundPid+"}";
 }
 public static void Click(long overlay,int x,int y){POINT p=new POINT();p.x=x;p.y=y; if(GetAncestor(WindowFromPoint(p),2).ToInt64()!=overlay)throw new Exception("Click target is not test overlay: abort");SetCursorPos(x,y);Thread.Sleep(30);INPUT d=new INPUT(); d.type=0;d.u.m.flags=2;INPUT u=d;u.u.m.flags=4;Send(new INPUT[]{d,u});}
}
