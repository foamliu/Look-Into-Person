from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import time

from selenium.webdriver import ActionChains

driver = webdriver.Safari()
driver.get("http://127.0.0.1:5000/home")

'''
Verification: 
The title text should be “Automatic Apparel Outliner”
'''
# Integration Testing – TC01 – START
assert "Automatic Apparel Outliner" in driver.title
# Integration Testing – TC01 – END


'''
Verification:
Verify that the following buttons exist in the app:
“Select File” on main page
“Outline Selected Segment” after the segmentation is complete
“Clear Outlines” after segment is selected
“Download Images” after segment is selected
'''
# Integration Testing - TC03 - START

# Test for 'Help Documents' button
try:
    driver.find_element_by_xpath('//*[@id="help-button"]')
    print('"Help Documents" button on main page found.')
except NoSuchElementException:
    print('"Help Documents" button on main page not found.')

# Test for 'Select A File' button
try:
    driver.find_element_by_xpath('//*[@id="upload"]')
    print('"Select A File" button on main page found.')
except NoSuchElementException:
    print('"Select A File" button on main page not found.')

# Test for 'Outlined Selected Segment' button
hidden_upload_button = driver.find_element_by_xpath('//*[@id="hidden-upload"]')
driver.execute_script("arguments[0].click();", hidden_upload_button)
time.sleep(10)
try:
    driver.find_element_by_xpath('//*[@id="container"]/div/ion-button')
    print('"Outline Selected Segment" button found.')
except NoSuchElementException:
    print('"Outline Selected Segment" button not found.')

processedImage = driver.find_element_by_xpath('//*[@id="processedImage"]')
action = ActionChains(driver)
action.move_to_element(processedImage).move_by_offset(5, 5).click().perform()  # outline color gets selected
time.sleep(5)
driver.find_element_by_xpath('//*[@id="container"]/div/ion-button').click()
time.sleep(5)

# Test for 'Clear Outlines' button
try:
    driver.find_element_by_xpath('//*[@id="container"]/div/ion-button[1]')
    print('"Clear Outlines" button found.')
except NoSuchElementException:
    print('"Clear Outlines" button not found.')

# Test for 'Download Images' button
try:
    driver.find_element_by_xpath('//*[@id="container"]/div/ion-button[2]')
    print('"Download Images" button found.')
except NoSuchElementException:
    print('"Download Images" button not found.')

# Integration Testing - TC03 - END

driver.close()
