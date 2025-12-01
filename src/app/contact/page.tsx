"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Home, Phone, Mail, MapPin, Clock } from "lucide-react";

const ContactPage = () => {

  const contactInfo = [
    {
      icon: Phone,
      title: "تلفن تماس",
      content: "۰۲۱-۱۲۳۴۵۶۷۸",
      link: "tel:+982112345678",
    },
    {
      icon: Mail,
      title: "ایمیل",
      content: "info@horsegallery.com",
      link: "mailto:info@horsegallery.com",
    },
    {
      icon: MapPin,
      title: "آدرس",
      content: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      link: null,
    },
    {
      icon: Clock,
      title: "ساعات کاری",
      content: "شنبه تا پنجشنبه: ۹ صبح تا ۸ شب",
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">تماس با ما</span>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-12 sm:pb-16 lg:pb-24">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 text-right"
        >
          <h1 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
            تماس با ما
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Right Side - Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-1"
          >
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-primary p-4 text-right border border-gray-300 rounded"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {info.title}
                      </h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-xs text-white/90 hover:text-white transition-colors"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-xs text-white/90">{info.content}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Google Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white border border-gray-300 rounded overflow-hidden"
            >
              <div className="w-full h-[350px] sm:h-[380px] lg:h-[480px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.8636764856287!2d51.421509876227726!3d35.70144007258068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e00491ff3dcd9%3A0xf0a77c6af3969efc!2sTehran%20Province%2C%20Tehran%2C%20Valiasr%20St%2C%20Iran!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map - Horse Gallery Location"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-2"
          >
            <div className="relative w-full h-[500px] sm:h-[570px] lg:h-[690px] overflow-hidden border border-gray-300 rounded">
              <Image
                src="/images/aboutUs/MainStore.webp"
                alt="Horse Gallery Store"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

