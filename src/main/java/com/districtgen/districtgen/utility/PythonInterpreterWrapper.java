package com.districtgen.districtgen.utility;

import org.python.core.PyInstance;
import org.python.util.PythonInterpreter;

public class PythonInterpreterWrapper {

    PythonInterpreter interpreter;
    public PythonInterpreterWrapper(){
        PythonInterpreter.initialize(System.getProperties(), System.getProperties(), new String[0]);
        this.interpreter = new PythonInterpreter();
    }

    private void execfile( final String fileName ){
        this.interpreter.execfile(fileName);
    }

    private PyInstance createClass( final String className, final String opts ){
        return (PyInstance) this.interpreter.eval(className + "(" + opts + ")");
    }

    public static void test(String gargs[]){
        PythonInterpreterWrapper piw = new PythonInterpreterWrapper();
        piw.execfile("hello.py");
        PyInstance hello = piw.createClass("Hello", "None");
        hello.invoke("run");
    }
}
