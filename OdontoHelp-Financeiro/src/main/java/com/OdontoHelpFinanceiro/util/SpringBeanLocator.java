package com.OdontoHelpFinanceiro.util;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

@Component
public class SpringBeanLocator implements ApplicationContextAware {

    private static ApplicationContext context;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        context = applicationContext;
    }

    public static <T> T getBean(Class<T> type) {
        if (context == null) {
            throw new IllegalStateException("Spring ApplicationContext ainda nao inicializado");
        }
        return context.getBean(type);
    }
}
